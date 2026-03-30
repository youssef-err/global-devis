import { describe, it, expect } from 'vitest';
import { mergeInvoicesFromRemote } from '../invoice/merge';
import type { InvoiceData, InvoiceHistoryRecord } from '@/types/invoice';

function makeInvoice(id: string, name = 'Test Co'): InvoiceData {
  return {
    sender: { name, address: '123 St', email: 'x@x.com' },
    recipient: { name: 'Client', address: '456 Ave', email: 'c@c.com' },
    details: {
      id,
      number: 'INV-0001',
      date: '2026-01-01',
      dueDate: '',
      currency: 'MAD',
      taxRate: 20,
      subject: 'Test',
      status: 'draft',
      template: 'classic',
    },
    items: [{ id: 'item-1', description: 'Service', quantity: 1, price: 100 }],
  };
}

describe('mergeInvoicesFromRemote', () => {
  it('returns local draft when no remote data', () => {
    const draft = makeInvoice('draft-id');
    const result = mergeInvoicesFromRemote({
      localDraft: draft,
      localHistory: [],
      remote: [],
    });
    expect(result.data.details.id).toBe('draft-id');
    expect(result.history).toHaveLength(1);
  });

  it('local draft wins over stale remote for same id', () => {
    const draftId = 'shared-id';
    const draft = makeInvoice(draftId, 'Local Version');
    const result = mergeInvoicesFromRemote({
      localDraft: draft,
      localHistory: [],
      remote: [
        {
          id: draftId,
          data: makeInvoice(draftId, 'Remote Version'),
          updated_at: new Date(Date.now() - 10000).toISOString(),
        },
      ],
    });
    expect(result.data.sender.name).toBe('Local Version');
  });

  it('includes remote-only invoices in history', () => {
    const draft = makeInvoice('draft-id');
    const result = mergeInvoicesFromRemote({
      localDraft: draft,
      localHistory: [],
      remote: [
        {
          id: 'remote-only',
          data: makeInvoice('remote-only', 'Remote Co'),
          updated_at: new Date(Date.now() - 5000).toISOString(),
        },
      ],
    });
    const ids = result.history.map((h) => h.id);
    expect(ids).toContain('remote-only');
    expect(ids).toContain('draft-id');
  });

  it('history is sorted newest first', () => {
    const draft = makeInvoice('draft-id');
    const history: InvoiceHistoryRecord[] = [
      {
        id: 'old-id',
        updatedAt: new Date(Date.now() - 100000).toISOString(),
        invoice: makeInvoice('old-id'),
      },
    ];
    const result = mergeInvoicesFromRemote({
      localDraft: draft,
      localHistory: history,
      remote: [],
    });
    const timestamps = result.history.map((h) => new Date(h.updatedAt).getTime());
    expect(timestamps[0]).toBeGreaterThanOrEqual(timestamps[timestamps.length - 1]);
  });

  it('newer remote wins over old local history', () => {
    const id = 'conflict-id';
    const futureTime = new Date(Date.now() + 60000).toISOString();
    const history: InvoiceHistoryRecord[] = [
      {
        id,
        updatedAt: new Date(Date.now() - 10000).toISOString(),
        invoice: makeInvoice(id, 'Old Local'),
      },
    ];
    const draft = makeInvoice('draft-id'); // different id
    const result = mergeInvoicesFromRemote({
      localDraft: draft,
      localHistory: history,
      remote: [
        { id, data: makeInvoice(id, 'Newer Remote'), updated_at: futureTime },
      ],
    });
    const found = result.history.find((h) => h.id === id);
    expect(found?.invoice.sender.name).toBe('Newer Remote');
  });
});
