'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceData, InvoiceHistoryRecord } from '@/types/invoice';
import { mergeInvoicesFromRemote } from '@/lib/invoice/merge';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

const DEBOUNCE_MS = 500;

function collectInvoicesToPersist(draft: InvoiceData, hist: InvoiceHistoryRecord[]): InvoiceData[] {
  const map = new Map<string, InvoiceData>();
  for (const h of hist) {
    map.set(h.id, h.invoice);
  }
  map.set(draft.details.id, draft);
  return Array.from(map.values());
}

function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

export function useInvoiceSync(params: {
  userId: string | null;
  supabase: SupabaseClient;
  data: InvoiceData;
  history: InvoiceHistoryRecord[];
  replaceState: (next: { data: InvoiceData; history: InvoiceHistoryRecord[] }) => void;
  dataRef: { current: InvoiceData };
  historyRef: { current: InvoiceHistoryRecord[] };
}): {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
} {
  const { userId, supabase, data, history, replaceState, dataRef, historyRef } = params;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  /** Last snapshot successfully persisted (local + cloud). */
  const lastPersistedRef = useRef<string>('');
  const syncInFlightRef = useRef(false);
  const queueRef = useRef<Array<() => Promise<void>>>([]);
  const syncReadyRef = useRef(false);

  const persistSnapshot = useCallback(
    async (uid: string, draft: InvoiceData, hist: InvoiceHistoryRecord[]) => {
      const invoices = collectInvoicesToPersist(draft, hist);
      const now = new Date().toISOString();
      const rows = invoices.map((inv) => ({
        id: inv.details.id,
        user_id: uid,
        data: inv,
        updated_at: now
      }));

      const { error } = await supabase.from('invoices').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      setLastSyncedAt(now);
    },
    [supabase]
  );

  useEffect(() => {
    if (!userId) {
      syncReadyRef.current = false;
      lastPersistedRef.current = '';
      setSyncStatus('idle');
      return;
    }

    let cancelled = false;

    (async () => {
      setSyncError(null);
      setSyncStatus('syncing');
      try {
        const localDraft = dataRef.current;
        const localHistory = historyRef.current;

        const { data: remoteRows, error } = await supabase.from('invoices').select('id, data, updated_at');

        if (error) throw error;
        if (cancelled) return;

        const remote = (remoteRows ?? []).map((r: { id: string; data: InvoiceData; updated_at: string }) => ({
          id: r.id,
          data: r.data,
          updated_at: r.updated_at
        }));

        const merged = mergeInvoicesFromRemote({
          localDraft,
          localHistory,
          remote
        });

        replaceState(merged);
        await persistSnapshot(userId, merged.data, merged.history);

        syncReadyRef.current = true;
        lastPersistedRef.current = JSON.stringify({ data: merged.data, history: merged.history });
        setSyncStatus(isOnline() ? 'idle' : 'offline');
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'Sync failed';
        setSyncError(message);
        setSyncStatus(isOnline() ? 'error' : 'offline');
        queueRef.current.push(async () => {
          await persistSnapshot(userId, dataRef.current, historyRef.current);
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, replaceState, persistSnapshot, dataRef, historyRef, supabase]);

  useEffect(() => {
    if (!userId || !syncReadyRef.current) return;

    const snapshot = JSON.stringify({ data, history });
    if (snapshot === lastPersistedRef.current) return;

    if (!isOnline()) {
      setSyncStatus('offline');
      queueRef.current.push(async () => {
        const latest = JSON.stringify({ data: dataRef.current, history: historyRef.current });
        await persistSnapshot(userId, dataRef.current, historyRef.current);
        lastPersistedRef.current = latest;
      });
      return;
    }

    const t = window.setTimeout(() => {
      if (syncInFlightRef.current) return;
      (async () => {
        const latest = JSON.stringify({ data: dataRef.current, history: historyRef.current });
        if (latest === lastPersistedRef.current) return;

        syncInFlightRef.current = true;
        setSyncStatus('syncing');
        setSyncError(null);
        try {
          await persistSnapshot(userId, dataRef.current, historyRef.current);
          lastPersistedRef.current = latest;
          setSyncStatus('idle');
        } catch (e) {
          setSyncError(e instanceof Error ? e.message : 'Sync failed');
          setSyncStatus('error');
          queueRef.current.push(async () => {
            await persistSnapshot(userId, dataRef.current, historyRef.current);
            lastPersistedRef.current = JSON.stringify({ data: dataRef.current, history: historyRef.current });
          });
        } finally {
          syncInFlightRef.current = false;
        }
      })();
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(t);
  }, [data, history, userId, persistSnapshot, dataRef, historyRef]);

  useEffect(() => {
    const flush = async () => {
      if (!userId || !isOnline()) return;
      const pending = [...queueRef.current];
      queueRef.current = [];
      for (const fn of pending) {
        try {
          await fn();
        } catch {
          /* noop */
        }
      }
      setSyncStatus('idle');
    };

    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [userId]);

  return { syncStatus, lastSyncedAt, syncError };
}
