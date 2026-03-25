"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Check,
  Download,
  FileText,
  GripVertical,
  Package,
  Percent,
  Plus,
  Receipt,
  Sparkles,
  Trash2
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceDetails {
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  number: string;
  date: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discount: number;
  shippingFee: number;
  notes: string;
}

const currencyOptions = ['USD', 'EUR', 'GBP', 'MAD'];
const stylePropertiesToInline = [
  'color',
  'background-color',
  'background-image',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'box-shadow',
  'outline-color',
  'text-decoration-color',
  'caret-color',
  'fill',
  'stroke'
] as const;

function createItem(id: string): InvoiceItem {
  return { id, description: '', quantity: 1, price: 0 };
}

function createDefaultDetails(locale: string): InvoiceDetails {
  return {
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    number: '',
    date: '',
    dueDate: '',
    currency: locale === 'ar' ? 'MAD' : 'USD',
    taxRate: 0,
    discount: 0,
    shippingFee: 0,
    notes: ''
  };
}

function getTodayIso() {
  return new Date().toISOString().split('T')[0] ?? '';
}

function createInvoiceNumber() {
  return `INV-${Math.floor(10000 + Math.random() * 90000)}`;
}

function formatMoney(value: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function normalizeCssValue(property: string, value: string) {
  if (!value || value === 'transparent' || value === 'none') {
    return value;
  }

  const probe = document.createElement('div');
  probe.style.setProperty(property, value);
  probe.style.position = 'fixed';
  probe.style.inset = '-9999px';
  probe.style.pointerEvents = 'none';
  document.body.appendChild(probe);
  const normalized = getComputedStyle(probe).getPropertyValue(property) || value;
  probe.remove();
  return normalized.trim() || value;
}

function prepareNodeForPdf(sourceNode: HTMLElement) {
  const clone = sourceNode.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.insetInlineStart = '0';
  clone.style.zIndex = '-1';
  clone.style.pointerEvents = 'none';
  clone.style.opacity = '1';
  clone.style.maxWidth = `${sourceNode.offsetWidth}px`;
  clone.style.width = `${sourceNode.offsetWidth}px`;
  clone.style.backgroundColor = '#ffffff';

  const sourceElements = [sourceNode, ...Array.from(sourceNode.querySelectorAll<HTMLElement>('*'))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];

  cloneElements.forEach((element, index) => {
    const sourceElement = sourceElements[index];
    if (!sourceElement) {
      return;
    }

    const computed = getComputedStyle(sourceElement);
    element.style.fontFamily = computed.fontFamily;
    element.style.letterSpacing = computed.letterSpacing;
    element.style.textTransform = computed.textTransform;

    stylePropertiesToInline.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value) {
        element.style.setProperty(property, normalizeCssValue(property, value));
      }
    });
  });

  document.body.appendChild(clone);
  return clone;
}

function GlassSection({
  icon,
  eyebrow,
  title,
  children
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  accentClass
}: {
  label: string;
  value: string | number;
  accentClass: string;
}) {
  return (
    <div className="min-w-0 rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
      <div className={`mb-3 h-1.5 w-12 rounded-full ${accentClass}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? 'text-white' : 'text-slate-300'}`}>
      <span className={strong ? 'text-sm font-medium text-slate-100' : 'text-sm'}>{label}</span>
      <span className={strong ? 'text-3xl font-semibold tracking-tight' : 'text-sm font-medium'}>
        {value}
      </span>
    </div>
  );
}

export default function InvoiceForm() {
  const t = useTranslations('Form');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const nextItemId = useRef(2);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [details, setDetails] = useState<InvoiceDetails>(() => createDefaultDetails(locale));
  const [items, setItems] = useState<InvoiceItem[]>(() => [createItem('item-1')]);

  useEffect(() => {
    setDetails((current) => ({
      ...current,
      currency: current.currency || (isArabic ? 'MAD' : 'USD'),
      number: current.number || createInvoiceNumber(),
      date: current.date || getTodayIso()
    }));
  }, [isArabic]);

  useEffect(() => {
    if (!exportSuccess) {
      return;
    }

    const timeout = window.setTimeout(() => setExportSuccess(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [exportSuccess]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items]
  );
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const taxableBase = Math.max(subtotal - details.discount, 0);
  const taxAmount = useMemo(
    () => (taxableBase * Math.max(details.taxRate, 0)) / 100,
    [details.taxRate, taxableBase]
  );
  const grandTotal = useMemo(
    () => taxableBase + taxAmount + Math.max(details.shippingFee, 0),
    [taxAmount, taxableBase, details.shippingFee]
  );

  const currencyFormatter = (value: number) => formatMoney(value, details.currency, locale);

  const updateDetails = <K extends keyof InvoiceDetails>(key: K, value: InvoiceDetails[K]) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    const nextId = `item-${nextItemId.current++}`;
    setItems((current) => [...current, createItem(nextId)]);
  };

  const removeItem = (id: string) => {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id)
    );
  };

  const handleDownload = async () => {
    const element = document.getElementById('invoice-preview-sheet');
    if (!element) {
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);
    let preparedNode: HTMLElement | null = null;

    try {
      preparedNode = prepareNodeForPdf(element);
      const canvas = await html2canvas(preparedNode, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`${details.number || 'invoice'}.pdf`);
      setExportSuccess(true);
    } finally {
      preparedNode?.remove();
      setIsExporting(false);
    }
  };

  const paperPreviewMeta = [
    { label: t('date'), value: details.date || '--' },
    { label: t('dueDate'), value: details.dueDate || '--' },
    { label: t('currency'), value: details.currency }
  ];

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className={`space-y-8 ${isArabic ? 'font-arabic' : ''}`}>
      <section className="rounded-[36px] border border-white/70 bg-slate-50/50 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                {t('workspaceBadge')}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {t('workspaceTitle')}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
                {t('workspaceDescription')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label={t('items')} value={items.length} accentClass="bg-indigo-500" />
              <StatCard label={t('qty')} value={totalQuantity} accentClass="bg-emerald-500" />
              <StatCard label={t('total')} value={currencyFormatter(grandTotal)} accentClass="bg-slate-900" />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
            <div className="grid gap-6">
              <GlassSection icon={<Receipt className="h-5 w-5" />} eyebrow={t('workspaceEyebrow')} title={t('businessSectionTitle')}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={t('yourCompanyName')}>
                    <input value={details.companyName} onChange={(event) => updateDetails('companyName', event.target.value)} className="app-input" placeholder={t('companyPlaceholder')} />
                  </Field>
                  <Field label={t('email')}>
                    <input value={details.companyEmail} onChange={(event) => updateDetails('companyEmail', event.target.value)} className="app-input" placeholder={t('companyEmailPlaceholder')} />
                  </Field>
                  <Field label={t('companyAddress')}>
                    <textarea value={details.companyAddress} onChange={(event) => updateDetails('companyAddress', event.target.value)} className="app-input min-h-28 resize-y py-4" placeholder={t('companyAddressPlaceholder')} />
                  </Field>
                  <div className="grid gap-5">
                    <Field label={t('invoiceNumber')}>
                      <input value={details.number} onChange={(event) => updateDetails('number', event.target.value)} className="app-input" />
                    </Field>
                    <Field label={t('currency')}>
                      <select value={details.currency} onChange={(event) => updateDetails('currency', event.target.value)} className="app-input appearance-none">
                        {currencyOptions.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </GlassSection>

              <GlassSection icon={<Package className="h-5 w-5" />} eyebrow={t('workspaceEyebrow')} title={t('clientSectionTitle')}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={t('clientName')}>
                    <input value={details.clientName} onChange={(event) => updateDetails('clientName', event.target.value)} className="app-input" placeholder={t('clientPlaceholder')} />
                  </Field>
                  <Field label={t('email')}>
                    <input value={details.clientEmail} onChange={(event) => updateDetails('clientEmail', event.target.value)} className="app-input" placeholder={t('clientEmailPlaceholder')} />
                  </Field>
                  <Field label={t('clientAddress')}>
                    <textarea value={details.clientAddress} onChange={(event) => updateDetails('clientAddress', event.target.value)} className="app-input min-h-28 resize-y py-4 md:col-span-2" placeholder={t('clientAddressPlaceholder')} />
                  </Field>
                </div>
              </GlassSection>
            </div>

            <GlassSection icon={<Percent className="h-5 w-5" />} eyebrow={t('workspaceEyebrow')} title={t('invoiceMetaSectionTitle')}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={t('date')}>
                  <input type="date" value={details.date} onChange={(event) => updateDetails('date', event.target.value)} className="app-input" />
                </Field>
                <Field label={t('dueDate')}>
                  <input type="date" value={details.dueDate} onChange={(event) => updateDetails('dueDate', event.target.value)} className="app-input" />
                </Field>
                <Field label={t('tax')}>
                  <input type="number" min="0" step="0.01" value={details.taxRate} onChange={(event) => updateDetails('taxRate', Number(event.target.value) || 0)} className="app-input" placeholder="0" />
                </Field>
                <Field label={t('discount')}>
                  <input type="number" min="0" step="0.01" value={details.discount} onChange={(event) => updateDetails('discount', Number(event.target.value) || 0)} className="app-input" placeholder="0" />
                </Field>
                <Field label={t('shippingFee')}>
                  <input type="number" min="0" step="0.01" value={details.shippingFee} onChange={(event) => updateDetails('shippingFee', Number(event.target.value) || 0)} className="app-input" placeholder="0" />
                </Field>
                <Field label={t('notes')}>
                  <textarea value={details.notes} onChange={(event) => updateDetails('notes', event.target.value)} className="app-input min-h-28 resize-y py-4" placeholder={t('optionalNotes')} />
                </Field>
              </div>
            </GlassSection>
          </div>

          <GlassSection icon={<FileText className="h-5 w-5" />} eyebrow={t('workspaceEyebrow')} title={t('lineItemsTitle')}>
            <div className="space-y-4">
              <div className="hidden grid-cols-[minmax(0,1.8fr)_120px_140px_110px] gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
                <span>{t('description')}</span>
                <span className="text-end">{t('qty')}</span>
                <span className="text-end">{t('rate')}</span>
                <span className="text-end">{t('rowActions')}</span>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="group rounded-[26px] border border-slate-200/80 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white lg:grid lg:grid-cols-[minmax(0,1.8fr)_120px_140px_110px] lg:items-start lg:gap-4 lg:p-5">
                    <Field label={t('description')}>
                      <input value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} placeholder={`${t('descriptionPlaceholder')} ${index + 1}`} className="app-input" />
                    </Field>

                    <div className="mt-4 grid grid-cols-2 gap-4 lg:mt-0 lg:contents">
                      <Field label={t('qty')}>
                        <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) || 0 })} className="app-input text-end" />
                      </Field>
                      <Field label={t('rate')}>
                        <input type="number" min="0" step="0.01" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) || 0 })} className="app-input text-end" />
                      </Field>
                    </div>

                    <div className="mt-4 flex items-end justify-end lg:mt-0">
                      <div className="flex items-center gap-2 opacity-100 transition-all duration-200 lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                        <button type="button" className="inline-flex h-11 w-11 cursor-grab items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-400 transition-colors hover:text-slate-700" aria-label={t('dragRow')}>
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeItem(item.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600" aria-label={t('deleteRow')}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={addItem} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800">
                  <Plus className="h-4 w-4" />
                  {t('addLineItem')}
                </button>

                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                  <span className="font-medium text-slate-900">{t('subtotal')}:</span> {currencyFormatter(subtotal)}
                </div>
              </div>
            </div>
          </GlassSection>
        </div>
      </section>

      <section className="rounded-[36px] bg-slate-100 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('previewEyebrow')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {t('previewTitle')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {t('previewDescription')}
            </p>
          </div>

          <button type="button" onClick={handleDownload} disabled={isExporting} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition-all duration-300 ${exportSuccess ? 'scale-[1.01] bg-emerald-500' : 'bg-[linear-gradient(135deg,_#0f172a,_#1e1b4b_50%,_#4f46e5)] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.28)]'} disabled:cursor-not-allowed disabled:opacity-70`}>
            {exportSuccess ? (
              <>
                <Check className="h-4 w-4 animate-pulse" />
                {t('downloadSuccess')}
              </>
            ) : (
              <>
                <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
                {isExporting ? t('downloadLoading') : t('downloadPdf')}
              </>
            )}
          </button>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-6">
          <article id="invoice-preview-sheet" className={`mx-auto w-full max-w-[860px] rounded-[30px] bg-white p-6 shadow-2xl shadow-slate-200/60 sm:p-8 lg:p-12 ${isArabic ? 'font-arabic' : ''}`}>
            <div className="flex flex-col gap-10">
              <header className="flex flex-col gap-8 border-b border-slate-200 pb-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700">
                    <FileText className="h-3.5 w-3.5" />
                    {t('documentBadge')}
                  </div>
                  <h3 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                    {details.number || '--'}
                  </h3>
                  <p className="mt-4 text-lg font-medium text-slate-900">
                    {details.companyName || t('companyPlaceholder')}
                  </p>
                  <div className="mt-3 space-y-1 text-sm leading-6 text-slate-500">
                    <p>{details.companyEmail || t('companyEmailPlaceholder')}</p>
                    <p>{details.companyAddress || t('companyAddressPlaceholder')}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:min-w-80">
                  <div className="rounded-[24px] bg-slate-50 px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t('billTo')}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {details.clientName || t('previewNoClient')}
                    </p>
                    <div className="mt-2 space-y-1 text-sm leading-6 text-slate-500">
                      <p>{details.clientEmail || t('clientEmailPlaceholder')}</p>
                      <p>{details.clientAddress || t('clientAddressPlaceholder')}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {paperPreviewMeta.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </header>

              <section className="overflow-hidden rounded-[26px] border border-slate-200">
                <div className="grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr] gap-4 bg-slate-50 px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>{t('description')}</span>
                  <span className="text-end">{t('qty')}</span>
                  <span className="text-end">{t('amount')}</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {items.map((item) => {
                    const rowTotal = item.quantity * item.price;
                    return (
                      <div key={item.id} className="grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr] gap-4 px-4 py-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.description || t('previewDescriptionPlaceholder')}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{currencyFormatter(item.price)}</p>
                        </div>
                        <p className="text-end font-medium text-slate-700">{item.quantity}</p>
                        <p className="text-end font-semibold text-slate-950">{currencyFormatter(rowTotal)}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t('notes')}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {details.notes || t('previewNotesFallback')}
                  </p>
                </div>

                <div className="rounded-[28px] bg-[linear-gradient(145deg,_#0f172a,_#1e1b4b_50%,_#4f46e5)] px-5 py-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.3)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {t('totalAmountLabel')}
                  </p>
                  <div className="mt-5 space-y-3">
                    <SummaryRow label={t('subtotal')} value={currencyFormatter(subtotal)} />
                    <SummaryRow label={t('discount')} value={currencyFormatter(details.discount)} />
                    <SummaryRow label={t('tax')} value={currencyFormatter(taxAmount)} />
                    <SummaryRow label={t('shippingFee')} value={currencyFormatter(details.shippingFee)} />
                    <div className="h-px bg-white/10" />
                    <SummaryRow label={t('total')} value={currencyFormatter(grandTotal)} strong />
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
