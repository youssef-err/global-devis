'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePdfDocument, { registerInvoiceFonts } from '@/components/PDFDocument';
import {
  ClientInfo,
  CompanyInfo,
  InvoiceData,
  InvoiceDetails,
  InvoiceHistoryRecord,
  InvoiceItem,
  InvoiceTotals
} from '@/types/invoice';
import {
  createDefaultInvoice,
  createId,
  createInvoiceNumber,
  DRAFT_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  getInitialDraft,
  getInitialHistory,
  sanitizeInvoice
} from '@/lib/invoice/constants';
import { storage } from '@/lib/storage';
import { useLocale } from 'next-intl';
import { getTaxConfig } from '@/lib/invoice/taxes';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export type InvoiceLanguage = 'ar' | 'en';
export type PreviewZoom = 50 | 75 | 100;

export interface UseInvoiceStateResult {
  data: InvoiceData;
  history: InvoiceHistoryRecord[];
  lang: InvoiceLanguage;
  zoom: PreviewZoom;
  isExporting: boolean;
  totals: InvoiceTotals;
  setLang: (lang: InvoiceLanguage) => void;
  setZoom: (zoom: PreviewZoom) => void;
  updateSender: (value: Partial<CompanyInfo>) => void;
  updateRecipient: (value: Partial<ClientInfo>) => void;
  updateDetails: (value: Partial<InvoiceDetails>) => void;
  addItem: () => string;
  updateItem: (id: string, value: Partial<InvoiceItem>) => void;
  removeItem: (id: string) => void;
  resetInvoice: () => void;
  saveInvoiceToHistory: () => void;
  loadInvoiceFromHistory: (historyId: string) => void;
  deleteInvoiceFromHistory: (historyId: string) => void;
  duplicateFromHistory: (historyId: string) => void;
  duplicateCurrentInvoice: () => void;
  exportPdf: () => Promise<void>;
  replaceState: (next: { data: InvoiceData; history: InvoiceHistoryRecord[] }) => void;
  dataRef: { current: InvoiceData };
  historyRef: { current: InvoiceHistoryRecord[] };
}

export function useInvoiceState(): UseInvoiceStateResult {
  const currentLocale = useLocale();

  const [data, setData] = useState<InvoiceData>(() => getInitialDraft(currentLocale));
  const [history, setHistory] = useState<InvoiceHistoryRecord[]>(() => getInitialHistory(currentLocale));
  const [lang, setLang] = useState<InvoiceLanguage>(currentLocale === 'ar' ? 'ar' : 'en');
  const [zoom, setZoom] = useState<PreviewZoom>(75);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const config = getTaxConfig(currentLocale);
    setData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        currency: config.currency,
        taxRate: config.taxRate,
        taxLabel: config.taxLabel
      }
    }));
  }, [currentLocale]);

  const dataRef = useRef(data);
  const historyRef = useRef(history);
  dataRef.current = data;
  historyRef.current = history;

  const totals = useMemo<InvoiceTotals>(() => {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const tax = subtotal * (data.details.taxRate / 100);
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [data.items, data.details.taxRate]);

  useEffect(() => {
    storage.save(DRAFT_STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    storage.save(HISTORY_STORAGE_KEY, history);
  }, [history]);

  const replaceState = useCallback((next: { data: InvoiceData; history: InvoiceHistoryRecord[] }) => {
    setData(sanitizeInvoice(next.data));
    setHistory(
      next.history.map((r) => ({
        id: r.id,
        updatedAt: r.updatedAt,
        invoice: sanitizeInvoice(r.invoice)
      }))
    );
    if (typeof window !== 'undefined') {
      storage.save(DRAFT_STORAGE_KEY, sanitizeInvoice(next.data));
      storage.save(HISTORY_STORAGE_KEY, next.history);
    }
  }, []);

  const updateSender = useCallback((value: Partial<CompanyInfo>) => {
    setData((prev) => ({ ...prev, sender: { ...prev.sender, ...value } }));
  }, []);

  const updateRecipient = useCallback((value: Partial<ClientInfo>) => {
    setData((prev) => ({ ...prev, recipient: { ...prev.recipient, ...value } }));
  }, []);

  const updateDetails = useCallback((value: Partial<InvoiceDetails>) => {
    setData((prev) => ({ ...prev, details: { ...prev.details, ...value } }));
  }, []);

  const duplicateInvoice = useCallback((invoice: InvoiceData): InvoiceData => {
    const next: InvoiceData = {
      ...invoice,
      sender: { ...invoice.sender },
      recipient: { ...invoice.recipient },
      details: {
        ...invoice.details,
        id: createId(),
        number: createInvoiceNumber(),
        status: 'draft'
      },
      items: invoice.items.map((item) => ({
        ...item,
        id: createId()
      }))
    };
    return next;
  }, []);

  const addItem = useCallback((): string => {
    const newId = createId();
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, price: 0 }]
    }));
    return newId;
  }, []);

  const updateItem = useCallback((id: string, value: Partial<InvoiceItem>) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...value } : item))
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setData((prev) => {
      if (prev.items.length === 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id)
      };
    });
  }, []);

  const resetInvoice = useCallback(() => {
    setData(createDefaultInvoice());
  }, []);

  const saveInvoiceToHistory = useCallback(() => {
    setHistory((prev) => {
      const current = dataRef.current;
      const id = current.details.id;
      const record: InvoiceHistoryRecord = {
        id,
        invoice: current,
        updatedAt: new Date().toISOString()
      };
      const exists = prev.some((item) => item.id === id);
      const next = exists
        ? prev.map((item) => (item.id === id ? record : item))
        : [record, ...prev];
      return next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
  }, []);

  const loadInvoiceFromHistory = useCallback(
    (historyId: string) => {
      const record = historyRef.current.find((item) => item.id === historyId);
      if (!record) return;
      setData(sanitizeInvoice(record.invoice));
    },
    []
  );

  const deleteInvoiceFromHistory = useCallback((historyId: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== historyId));
  }, []);

  const duplicateFromHistory = useCallback(
    (historyId: string) => {
      const record = historyRef.current.find((item) => item.id === historyId);
      if (!record) return;
      setData(duplicateInvoice(record.invoice));
    },
    [duplicateInvoice]
  );

  const duplicateCurrentInvoice = useCallback(() => {
    setData((prev) => duplicateInvoice(prev));
  }, [duplicateInvoice]);

  const exportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      trackEvent(AnalyticsEvents.PDF_DOWNLOAD, { template: data.details.template });
      registerInvoiceFonts();
      const blob = await pdf(
        <InvoicePdfDocument data={data} totals={totals} lang={lang} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${data.details.number}.pdf`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [data, totals, lang]);

  return {
    data,
    history,
    lang,
    zoom,
    isExporting,
    totals,
    setLang,
    setZoom,
    updateSender,
    updateRecipient,
    updateDetails,
    addItem,
    updateItem,
    removeItem,
    resetInvoice,
    saveInvoiceToHistory,
    loadInvoiceFromHistory,
    deleteInvoiceFromHistory,
    duplicateFromHistory,
    duplicateCurrentInvoice,
    exportPdf,
    replaceState,
    dataRef,
    historyRef
  };
}
