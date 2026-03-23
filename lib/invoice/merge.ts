import { InvoiceData, InvoiceHistoryRecord } from '@/types/invoice';

function parseTime(iso: string | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Merge remote rows with local history + current draft.
 * For each invoice id, the version with the latest timestamp wins.
 * Current draft is treated as "now" so unsaved local edits win over stale remote for the same id.
 */
export function mergeInvoicesFromRemote(args: {
  localDraft: InvoiceData;
  localHistory: InvoiceHistoryRecord[];
  remote: { id: string; data: InvoiceData; updated_at: string }[];
}): { data: InvoiceData; history: InvoiceHistoryRecord[] } {
  const { localDraft, localHistory, remote } = args;

  type Entry = { id: string; invoice: InvoiceData; t: number };

  const entries: Entry[] = [];

  for (const h of localHistory) {
    entries.push({ id: h.id, invoice: h.invoice, t: parseTime(h.updatedAt) });
  }

  for (const r of remote) {
    entries.push({ id: r.id, invoice: r.data, t: parseTime(r.updated_at) });
  }

  entries.push({
    id: localDraft.details.id,
    invoice: localDraft,
    t: Date.now()
  });

  const byId = new Map<string, InvoiceHistoryRecord>();

  for (const e of entries) {
    const prev = byId.get(e.id);
    const prevT = prev ? parseTime(prev.updatedAt) : -1;
    if (!prev || e.t >= prevT) {
      byId.set(e.id, {
        id: e.id,
        invoice: e.invoice,
        updatedAt: new Date(e.t).toISOString()
      });
    }
  }

  const history = Array.from(byId.values()).sort(
    (a, b) => parseTime(b.updatedAt) - parseTime(a.updatedAt)
  );

  const draftMerged = byId.get(localDraft.details.id);
  const data = draftMerged?.invoice ?? localDraft;

  return { data, history };
}
