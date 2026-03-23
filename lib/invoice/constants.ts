import { InvoiceData, InvoiceHistoryRecord } from '@/types/invoice';
import { storage } from '../storage';
import { getTaxConfig } from './taxes';

export const DRAFT_STORAGE_KEY = 'globaldevis.invoice.draft.v3';
export const HISTORY_STORAGE_KEY = 'globaldevis.invoice.history.v1';

export const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export const createInvoiceNumber = () => `INV-${Math.floor(1000 + Math.random() * 9000)}`;
export const today = () => new Date().toISOString().split('T')[0];

export const createDefaultInvoice = (locale: string = 'en'): InvoiceData => {
  const config = getTaxConfig(locale);
  
  return {
    sender: {
      name: 'GLOBAL DEVIS S.A.R.L',
      address: 'Casablanca, Morocco',
      email: 'contact@global.com'
    },
    recipient: {
      name: '',
      address: '',
      email: ''
    },
    details: {
      id: createId(),
      number: createInvoiceNumber(),
      date: today(),
      dueDate: '',
      currency: config.currency,
      taxRate: config.taxRate,
      taxLabel: config.taxLabel,
      subject: '',
      status: 'draft',
      template: 'classic'
    },
    items: [{ id: createId(), description: '', quantity: 1, price: 0 }]
  };
};

export const sanitizeInvoice = (invoice: InvoiceData, locale: string = 'en'): InvoiceData => {
  const base = createDefaultInvoice(locale);
  return {
    ...base,
    ...invoice,
    sender: { ...base.sender, ...invoice.sender },
    recipient: { ...base.recipient, ...invoice.recipient },
    details: {
      ...base.details,
      ...invoice.details,
      status: invoice.details.status ?? 'draft',
      template: invoice.details.template ?? 'classic',
      taxLabel: invoice.details.taxLabel ?? base.details.taxLabel
    },
    items:
      Array.isArray(invoice.items) && invoice.items.length > 0
        ? invoice.items.map((item) => ({
            id: item.id || createId(),
            description: item.description ?? '',
            quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
            price: Number.isFinite(item.price) ? item.price : 0
          }))
        : base.items
  };
};

export const getInitialDraft = (locale: string = 'en'): InvoiceData => {
  if (typeof window === 'undefined') return createDefaultInvoice(locale);
  try {
    const draft = storage.load<InvoiceData>(DRAFT_STORAGE_KEY);
    if (!draft) {
      const legacy = storage.load<InvoiceData>('globaldevis.invoice.draft.v2');
      if (legacy) {
        const parsed = sanitizeInvoice(legacy);
        storage.save(DRAFT_STORAGE_KEY, parsed);
        return parsed;
      }
      return createDefaultInvoice();
    }
    return sanitizeInvoice(draft, locale);
  } catch {
    return createDefaultInvoice(locale);
  }
};

export const getInitialHistory = (locale: string = 'en'): InvoiceHistoryRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = storage.load<InvoiceHistoryRecord[]>(HISTORY_STORAGE_KEY);
    if (!parsed || !Array.isArray(parsed)) return [];
    return parsed
      .filter((record) => record?.id && record?.invoice)
      .map((record) => ({
        id: record.id,
        updatedAt: record.updatedAt || new Date().toISOString(),
        invoice: sanitizeInvoice(record.invoice, locale)
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
};
