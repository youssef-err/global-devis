'use client';

import { useInvoiceState } from '@/hooks/useInvoiceState';
import { useInvoiceSync, type SyncStatus } from '@/hooks/useInvoiceSync';
import { useAuth } from '@/contexts/auth-context';
import type { UseInvoiceStateResult, InvoiceLanguage, PreviewZoom } from '@/hooks/useInvoiceState';

export type { InvoiceLanguage, PreviewZoom };
export type { SyncStatus };
export type { UseInvoiceStateResult };

export interface UseInvoiceResult extends UseInvoiceStateResult {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
}

export function useInvoice(): UseInvoiceResult {
  const state = useInvoiceState();
  const { user, supabase } = useAuth();

  const sync = useInvoiceSync({
    userId: user?.id ?? null,
    supabase,
    data: state.data,
    history: state.history,
    replaceState: state.replaceState,
    dataRef: state.dataRef,
    historyRef: state.historyRef
  });

  return {
    ...state,
    syncStatus: sync.syncStatus,
    lastSyncedAt: sync.lastSyncedAt,
    syncError: sync.syncError
  };
}
