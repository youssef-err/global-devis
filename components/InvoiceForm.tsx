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
  Layers3,
  Package,
  Plus,
  Receipt,
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

function FormSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[#e2e8f0] bg-[#f8fafc] p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
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
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-1 items-center gap-4 rounded-[1.75rem] border border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-indigo-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function InvoiceForm() {
  const t = useTranslations('Form');
  const tHome = useTranslations('HomePage');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const nextItemId = useRef(2);

  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [details, setDetails] = useState<InvoiceDetails>(() => createDefaultDetails(locale));
  const [items, setItems] = useState<InvoiceItem[]>([createItem('item-1')]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setDetails((current) => ({
      ...current,
      currency: current.currency || (isArabic ? 'MAD' : 'USD'),
      number: current.number || createInvoiceNumber(),
      date: current.date || getTodayIso()
    }));
  }, [isArabic, mounted]);

  useEffect(() => {
    if (!exportSuccess) {
      return;
    }

    const timeout = window.setTimeout(() => setExportSuccess(false), 1700);
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
    [details.shippingFee, taxAmount, taxableBase]
  );

  const inputClassName =
    'w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100';

  const iconButtonClassName =
    'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-slate-500 shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:scale-[1.03] hover:border-slate-300 hover:text-slate-900';

  const formatCurrency = (value: number) => formatMoney(value, details.currency, locale);

  const updateDetails = <K extends keyof InvoiceDetails>(key: K, value: InvoiceDetails[K]) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    const id = `item-${nextItemId.current++}`;
    setItems((current) => [...current, createItem(id)]);
  };

  const removeItem = (id: string) => {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id)
    );
  };

  const downloadPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) {
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          const preview = clonedDoc.getElementById('invoice-preview');
          if (!preview) {
            return;
          }

          const previewEl = preview as HTMLElement;
          previewEl.style.backgroundColor = '#ffffff';
          previewEl.style.color = '#1e293b';
          previewEl.style.direction = isArabic ? 'rtl' : 'ltr';
          previewEl.style.textAlign = isArabic ? 'right' : 'left';
          previewEl.style.fontFamily = '"Tajawal", "Cairo", Arial, sans-serif';

          const elements = preview.querySelectorAll('*');
          elements.forEach((node) => {
            const el = node as HTMLElement;
            const style = window.getComputedStyle(el);

            if (style.color.includes('okl')) {
              el.style.color = '#1e293b';
            }

            if (style.backgroundColor.includes('okl')) {
              el.style.backgroundColor = '#ffffff';
            }

            if (style.borderColor.includes('okl')) {
              el.style.borderColor = '#cbd5e1';
            }

            if (style.boxShadow.includes('okl')) {
              el.style.boxShadow = 'none';
            }

            if (isArabic) {
              el.style.direction = 'rtl';
              el.style.unicodeBidi = 'plaintext';
              el.style.fontFamily = '"Tajawal", "Cairo", Arial, sans-serif';
              el.style.letterSpacing = '0';
            }
          });
        }
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imageProps = pdf.getImageProperties(imageData);
      const imageHeight = (imageProps.height * pageWidth) / imageProps.width;

      pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, imageHeight);
      pdf.save(`${details.number || 'invoice'}.pdf`);
      setExportSuccess(true);
    } finally {
      setIsExporting(false);
    }
  };

  const previewMeta = [
    { label: t('date'), value: details.date || '--' },
    { label: t('dueDate'), value: details.dueDate || '--' },
    { label: t('currency'), value: details.currency }
  ];

  const howItWorksCards = [
    { key: 'step1', icon: <Layers3 className="h-5 w-5" /> },
    { key: 'step2', icon: <Receipt className="h-5 w-5" /> },
    { key: 'step3', icon: <Download className="h-5 w-5" /> }
  ];

  if (!mounted) {
    return <div className="min-h-[70vh] bg-[#f8fafc]" />;
  }

  return (
    <div
      id="top"
      dir={isArabic ? 'rtl' : 'ltr'}
      className="bg-[#f8fafc] font-arabic"
    >
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <section className="pt-20 text-center">
          <h1 className="font-arabic bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            {tHome('heroTitle')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {t('workspaceDescription')}
          </p>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row">
            <StatCard icon={<Receipt className="h-5 w-5" />} label={t('total')} value={formatCurrency(grandTotal)} />
            <StatCard icon={<Package className="h-5 w-5" />} label={t('qty')} value={totalQuantity} />
            <StatCard icon={<Layers3 className="h-5 w-5" />} label={t('items')} value={items.length} />
          </div>
        </section>

        <section id="features" className="mt-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {howItWorksCards.map((step) => (
              <article
                key={step.key}
                className="flex items-start gap-4 rounded-[2rem] border border-[#e2e8f0] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(15,23,42,0.04)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-indigo-600">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {tHome(`${step.key}Title`)}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {tHome(`${step.key}Desc`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_420px]">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-10">
              <div className="space-y-8">
                <FormSection title={t('businessSectionTitle')}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label={t('yourCompanyName')}>
                      <input
                        value={details.companyName}
                        onChange={(event) => updateDetails('companyName', event.target.value)}
                        className={inputClassName}
                        placeholder={t('companyPlaceholder')}
                      />
                    </Field>
                    <Field label={t('email')}>
                      <input
                        value={details.companyEmail}
                        onChange={(event) => updateDetails('companyEmail', event.target.value)}
                        className={inputClassName}
                        placeholder={t('companyEmailPlaceholder')}
                      />
                    </Field>
                    <Field label={t('companyAddress')}>
                      <textarea
                        value={details.companyAddress}
                        onChange={(event) => updateDetails('companyAddress', event.target.value)}
                        className={`${inputClassName} min-h-28 resize-y`}
                        placeholder={t('companyAddressPlaceholder')}
                      />
                    </Field>
                    <div className="grid gap-5">
                      <Field label={t('invoiceNumber')}>
                        <input
                          value={details.number}
                          onChange={(event) => updateDetails('number', event.target.value)}
                          className={inputClassName}
                        />
                      </Field>
                      <Field label={t('currency')}>
                        <select
                          value={details.currency}
                          onChange={(event) => updateDetails('currency', event.target.value)}
                          className={inputClassName}
                        >
                          {currencyOptions.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                </FormSection>

                <FormSection title={t('clientSectionTitle')}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label={t('clientName')}>
                      <input
                        value={details.clientName}
                        onChange={(event) => updateDetails('clientName', event.target.value)}
                        className={inputClassName}
                        placeholder={t('clientPlaceholder')}
                      />
                    </Field>
                    <Field label={t('email')}>
                      <input
                        value={details.clientEmail}
                        onChange={(event) => updateDetails('clientEmail', event.target.value)}
                        className={inputClassName}
                        placeholder={t('clientEmailPlaceholder')}
                      />
                    </Field>
                    <Field label={t('clientAddress')}>
                      <textarea
                        value={details.clientAddress}
                        onChange={(event) => updateDetails('clientAddress', event.target.value)}
                        className={`${inputClassName} min-h-28 resize-y md:col-span-2`}
                        placeholder={t('clientAddressPlaceholder')}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title={t('invoiceMetaSectionTitle')}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label={t('date')}>
                      <input
                        type="date"
                        value={details.date}
                        onChange={(event) => updateDetails('date', event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label={t('dueDate')}>
                      <input
                        type="date"
                        value={details.dueDate}
                        onChange={(event) => updateDetails('dueDate', event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label={t('tax')}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={details.taxRate}
                        onChange={(event) => updateDetails('taxRate', Number(event.target.value) || 0)}
                        className={inputClassName}
                        placeholder="0"
                      />
                    </Field>
                    <Field label={t('discount')}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={details.discount}
                        onChange={(event) => updateDetails('discount', Number(event.target.value) || 0)}
                        className={inputClassName}
                        placeholder="0"
                      />
                    </Field>
                    <Field label={t('shippingFee')}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={details.shippingFee}
                        onChange={(event) => updateDetails('shippingFee', Number(event.target.value) || 0)}
                        className={inputClassName}
                        placeholder="0"
                      />
                    </Field>
                    <Field label={t('notes')}>
                      <textarea
                        value={details.notes}
                        onChange={(event) => updateDetails('notes', event.target.value)}
                        className={`${inputClassName} min-h-28 resize-y`}
                        placeholder={t('optionalNotes')}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title={t('lineItemsTitle')}>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-[1.75rem] border border-[#dbe4ef] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]"
                      >
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_110px_130px_auto]">
                          <Field label={t('description')}>
                            <input
                              value={item.description}
                              onChange={(event) =>
                                updateItem(item.id, { description: event.target.value })
                              }
                              className={inputClassName}
                              placeholder={`${t('descriptionPlaceholder')} ${index + 1}`}
                            />
                          </Field>
                          <Field label={t('qty')}>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(item.id, {
                                  quantity: Number(event.target.value) || 0
                                })
                              }
                              className={`${inputClassName} text-end`}
                            />
                          </Field>
                          <Field label={t('rate')}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(event) =>
                                updateItem(item.id, { price: Number(event.target.value) || 0 })
                              }
                              className={`${inputClassName} text-end`}
                            />
                          </Field>
                          <div className="flex items-end justify-end gap-2">
                            <button
                              type="button"
                              aria-label={t('dragRow')}
                              className={iconButtonClassName}
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={t('deleteRow')}
                              className={`${iconButtonClassName} hover:border-red-200 hover:text-red-600`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(79,70,229,0.24)] transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" />
                        {t('addLineItem')}
                      </button>

                      <div className="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">{t('subtotal')}:</span>{' '}
                        {formatCurrency(subtotal)}
                      </div>
                    </div>
                  </div>
                </FormSection>
              </div>
            </div>

            <aside id="pricing" className="xl:sticky xl:top-28 xl:self-start">
              <div className="rounded-[2.25rem] border border-[#e2e8f0] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-5">
                <div className="mb-5 flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('previewTitle')}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {t('previewDescription')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={downloadPDF}
                    disabled={isExporting}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] ${
                      exportSuccess ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {exportSuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t('downloadSuccess')}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        {isExporting ? t('downloadLoading') : t('downloadPdf')}
                      </>
                    )}
                  </button>
                </div>

                <article
                  id="invoice-preview"
                  className="overflow-hidden rounded-[2rem] border border-[#e2e8f0] bg-white"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)'
                  }}
                >
                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col gap-7">
                      <header
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '24px'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '999px',
                            backgroundColor: '#eef2ff',
                            color: '#4338ca',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {t('documentBadge')}
                        </div>

                        <h3 className="mt-4 text-3xl font-black text-slate-900">
                          {details.number || '--'}
                        </h3>

                        <div className="mt-5 space-y-1">
                          <p className="text-lg font-bold text-slate-900">
                            {details.companyName || t('companyPlaceholder')}
                          </p>
                          <p className="text-sm text-slate-500">
                            {details.companyEmail || t('companyEmailPlaceholder')}
                          </p>
                          <p className="text-sm leading-7 text-slate-500">
                            {details.companyAddress || t('companyAddressPlaceholder')}
                          </p>
                        </div>
                      </header>

                      <section
                        className="rounded-[1.75rem] p-4"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                          {t('billTo')}
                        </p>
                        <p className="mt-3 text-base font-bold text-slate-900">
                          {details.clientName || t('previewNoClient')}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {details.clientEmail || t('clientEmailPlaceholder')}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-slate-500">
                          {details.clientAddress || t('clientAddressPlaceholder')}
                        </p>
                      </section>
                      <section className="grid gap-3 sm:grid-cols-3">
                        {previewMeta.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[1.4rem] p-4"
                            style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </section>

                      <section
                        className="overflow-hidden rounded-[1.75rem]"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.55fr 0.55fr 0.8fr',
                            gap: '12px',
                            backgroundColor: '#f8fafc',
                            color: '#64748b',
                            padding: '14px 16px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          <span>{t('description')}</span>
                          <span style={{ textAlign: 'end' }}>{t('qty')}</span>
                          <span style={{ textAlign: 'end' }}>{t('amount')}</span>
                        </div>

                        <div>
                          {items.map((item, index) => {
                            const rowTotal = item.quantity * item.price;

                            return (
                              <div
                                key={item.id}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.55fr 0.55fr 0.8fr',
                                  gap: '12px',
                                  padding: '14px 16px',
                                  borderTop: index === 0 ? 'none' : '1px solid #e2e8f0'
                                }}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {item.description || t('previewDescriptionPlaceholder')}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <p className="text-end text-sm font-semibold text-slate-900">
                                  {item.quantity}
                                </p>
                                <p className="text-end text-sm font-bold text-slate-900">
                                  {formatCurrency(rowTotal)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section
                        className="rounded-[1.75rem] p-5 text-white"
                        style={{
                          background: 'linear-gradient(145deg, #1e293b, #0f172a 55%, #312e81)',
                          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)'
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
                          {t('totalAmountLabel')}
                        </p>

                        <div className="mt-5 space-y-3">
                          {[
                            { label: t('subtotal'), value: formatCurrency(subtotal) },
                            { label: t('discount'), value: formatCurrency(details.discount) },
                            { label: t('tax'), value: formatCurrency(taxAmount) },
                            { label: t('shippingFee'), value: formatCurrency(details.shippingFee) }
                          ].map((row) => (
                            <div
                              key={row.label}
                              className="flex items-center justify-between gap-4 text-sm text-slate-300"
                            >
                              <span>{row.label}</span>
                              <span className="font-semibold">{row.value}</span>
                            </div>
                          ))}

                          <div
                            style={{
                              height: '1px',
                              backgroundColor: 'rgba(255,255,255,0.12)'
                            }}
                          />

                          <div className="flex items-end justify-between gap-4">
                            <span className="text-sm font-semibold text-slate-100">
                              {t('total')}
                            </span>
                            <span className="text-3xl font-black text-white">
                              {formatCurrency(grandTotal)}
                            </span>
                          </div>
                        </div>
                      </section>

                      <section
                        className="rounded-[1.75rem] p-4"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                          {t('notes')}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {details.notes || t('previewNotesFallback')}
                        </p>
                      </section>
                    </div>
                  </div>
                </article>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
