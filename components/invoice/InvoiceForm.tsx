"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plus,
  Trash2,
  Building2,
  User,
  Settings2,
  FileText,
  PenTool
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Tajawal } from 'next/font/google';
import { numberToArabicWords } from '@/lib/numberToArabic';
import { numberToFrenchWords } from '@/lib/numberToFrench';
import { createInvoiceNumber } from '@/lib/invoice/constants';
import SmartActionsToolbar from './SmartActionsToolbar';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-tajawal',
});

// --- Interfaces ---
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceDetails {
  companyName: string; companyEmail: string; companyAddress: string;
  companyLogo?: string; // Base64 encoded logo image
  clientName: string; clientEmail: string; clientAddress: string;
  number: string; date: string; dueDate: string;
  currency: string; taxRate: number; discount: number;
  shippingFee: number; notes: string; invoicePurpose?: string;
  companyIce?: string; clientIce?: string;
  signatureImage?: string; // Base64 encoded signature image
}

// --- Calculation Function ---
function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number, discount: number, shippingFee: number) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalTTC = subtotal + taxAmount + shippingFee - discount;

  return {
    subtotal,
    taxAmount,
    totalTTC
  };
}

// --- Sub-components (Formatting Toolkit) ---
function FormSection({ title, icon, children, helper, isHighlighted }: { title: string; icon: ReactNode; children: ReactNode; helper?: string; isHighlighted?: boolean }) {
  return (
    <section className={`app-card transition-all duration-500 ${isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-lg shadow-indigo-500/10' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {helper && <p className="text-xs text-slate-500 mt-0.5">{helper}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-sm text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function InvoiceForm() {
  const t = useTranslations('Form');
  const tInvoice = useTranslations('Invoice');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [mounted, setMounted] = useState(false);
  const [details, setDetails] = useState<InvoiceDetails>({
    companyName: '', companyEmail: '', companyAddress: '', companyLogo: '',
    clientName: '', clientEmail: '', clientAddress: '',
    number: createInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    dueDate: '', currency: 'MAD', taxRate: 0, discount: 0, shippingFee: 0, notes: '', invoicePurpose: '',
    companyIce: '', clientIce: '', signatureImage: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, price: 0 }]);
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [signature, setSignature] = useState<string>('');
  const [signatureMode, setSignatureMode] = useState<'canvas' | 'upload'>('canvas');

  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 300);
  }, []);

  const steps = [
    { id: 0, label: t('step1') },
    { id: 1, label: t('step2') },
    { id: 2, label: t('step3') },
  ];

  const currentStep = useMemo(() => {
    if (details.clientName) return 2;
    if (details.companyName) return 1;
    return 0;
  }, [details.companyName, details.clientName]);

  // --- Calculations ---
  const { subtotal, taxAmount, totalTTC } = useMemo(() =>
    calculateInvoiceTotals(items, details.taxRate, details.discount, details.shippingFee),
    [items, details.taxRate, details.discount, details.shippingFee]
  );

  // --- Number to Words ---
  const totalInWords = useMemo(() => {
    const amount = Math.round(totalTTC);
    if (isArabic) {
      return numberToArabicWords(totalTTC);
    } else {
      return numberToFrenchWords(amount) + ' dirhams';
    }
  }, [totalTTC, isArabic]);

  // --- Currency Symbol ---
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'MAD': return isArabic ? tInvoice('currencyDirham') : tInvoice('currencyDH');
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  const updateDetails = (key: keyof InvoiceDetails, val: unknown) => setDetails(prev => ({ ...prev, [key]: val }));
  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const downloadPDF = async () => {
    if (typeof window === 'undefined') return;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    const el = document.getElementById('invoice-preview');
    if (!el) return;
    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (_clonedDoc, clonedEl) => {
        const root = clonedEl.ownerDocument;
        const styleTags = root.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          const text = styleTags[i].textContent ?? '';
          if (text.includes('oklch') || text.includes('oklab') || text.includes('lab(')) {
            styleTags[i].textContent = text
              .replace(/oklch\([^)]+\)/g, '#000000')
              .replace(/oklab\([^)]+\)/g, '#000000')
              .replace(/lab\([^)]+\)/g, '#000000');
          }
        }
      },
    });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(`${details.number}.pdf`);
    trackEvent(AnalyticsEvents.PDF_DOWNLOAD, {
      invoice_number: details.number,
      currency: details.currency,
      total: Number(totalTTC.toFixed(2))
    });
  };

  if (!mounted) return null;

  const inputClass =
    "app-input h-10 text-sm focus:ring-2 focus:ring-black/20";

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${isArabic ? tajawal.variable : ''} font-arabic animate-fade-up`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-[1400px] px-6 pt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6 items-start">
          
          {/* 🛠️ Editor Column */}
          <div className="space-y-6">
            <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur-md">
              <h1 className="text-2xl font-semibold text-slate-900">{t('workspaceTitle')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('workspaceDescription')}</p>
              
              {/* Step Progress */}
              <div className="mt-4 flex items-center gap-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      currentStep >= step.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <span>{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              
              <p className="mt-3 text-sm text-slate-700">{t('credibilityLine')}</p>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {t('trustMessage')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSection 
                title={t('companyInfo')} 
                icon={<Building2 size={20}/>}
                helper={t('companyInfoHelper')}
                isHighlighted={currentStep === 0}
              >
                <Field label={tInvoice('upload_logo')}>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateDetails('companyLogo', event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} className={`${inputClass} file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-black/90`}/>
                </Field>
                <Field label={t('yourCompanyName')}>
                  <input 
                    ref={firstInputRef}
                    className={inputClass} 
                    value={details.companyName} 
                    onChange={e => updateDetails('companyName', e.target.value)}
                    placeholder={t('companyPlaceholder')}
                  />
                </Field>
                <Field label={t('email')}><input className={inputClass} value={details.companyEmail} onChange={e => updateDetails('companyEmail', e.target.value)} placeholder={t('companyEmailPlaceholder')}/></Field>
                <Field label={t('ice')}><input className={inputClass} value={details.companyIce || ''} onChange={e => updateDetails('companyIce', e.target.value)} maxLength={15} placeholder={t('icePlaceholder')}/></Field>
                <Field label={t('companyAddress')}><textarea className={`${inputClass} h-20`} value={details.companyAddress} onChange={e => updateDetails('companyAddress', e.target.value)} placeholder={t('companyAddressPlaceholder')}/></Field>
              </FormSection>

              <FormSection 
                title={t('clientInfo')} 
                icon={<User size={20}/>}
                helper={t('clientInfoHelper')}
                isHighlighted={currentStep === 1}
              >
                <Field label={t('clientName')}><input className={inputClass} value={details.clientName} onChange={e => updateDetails('clientName', e.target.value)} placeholder={t('clientPlaceholder')}/></Field>
                <Field label={t('email')}><input className={inputClass} value={details.clientEmail} onChange={e => updateDetails('clientEmail', e.target.value)} placeholder={t('clientEmailPlaceholder')}/></Field>
                <Field label={t('iceClient')}><input className={inputClass} value={details.clientIce || ''} onChange={e => updateDetails('clientIce', e.target.value)} maxLength={15} placeholder={t('iceClientPlaceholder')}/></Field>
                <Field label={t('clientAddress')}><textarea className={`${inputClass} h-20`} value={details.clientAddress} onChange={e => updateDetails('clientAddress', e.target.value)} placeholder={t('clientAddressPlaceholder')}/></Field>
              </FormSection>
            </div>

            <FormSection title={t('invoiceDetails')} icon={<Settings2 size={20}/>}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label={t('invoiceNumber')}><input className={inputClass} value={details.number} onChange={e => updateDetails('number', e.target.value)}/></Field>
                <Field label={t('date')}><input type="date" className={inputClass} value={details.date} onChange={e => updateDetails('date', e.target.value)}/></Field>
                <Field label={t('dueDate')}><input type="date" className={inputClass} value={details.dueDate} onChange={e => updateDetails('dueDate', e.target.value)}/></Field>
                <Field label={t('currency')}>
                  <select className={inputClass} value={details.currency} onChange={e => updateDetails('currency', e.target.value)}>
                    {['MAD', 'USD', 'EUR', 'GBP', 'CAD', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Field label={t('tax')}><input type="number" className={inputClass} value={details.taxRate} onChange={e => updateDetails('taxRate', Number(e.target.value))}/></Field>
                <Field label={t('discount')}><input type="number" className={inputClass} value={details.discount} onChange={e => updateDetails('discount', Number(e.target.value))}/></Field>
                <Field label={t('shippingFee')}><input type="number" className={inputClass} value={details.shippingFee} onChange={e => updateDetails('shippingFee', Number(e.target.value))}/></Field>
              </div>
              <Field label={tInvoice('purpose')}><input type="text" className={inputClass} value={details.invoicePurpose || ''} onChange={e => updateDetails('invoicePurpose', e.target.value)} placeholder={t('purposePlaceholder')}/></Field>
              <Field label={tInvoice('notes')}><textarea className={`${inputClass} h-20`} value={details.notes} onChange={e => updateDetails('notes', e.target.value)} placeholder={t('notesPlaceholder')}/></Field>
              <div className="mt-4">
                <Field label="Theme Color">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600">{themeColor}</span>
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection title={t('items')} icon={<FileText size={20}/>}>
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 mb-3 items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex-grow"><input placeholder={t('description')} className={inputClass} value={item.description} onChange={e => updateItem(item.id, {description: e.target.value})}/></div>
                  <div className="w-24"><input type="number" placeholder={t('qty')} className={inputClass} value={item.quantity} onChange={e => updateItem(item.id, {quantity: Number(e.target.value)})}/></div>
                  <div className="w-28"><input type="number" placeholder={t('rate')} className={inputClass} value={item.price} onChange={e => updateItem(item.id, {price: Number(e.target.value)})}/></div>
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label={t('deleteRow')}><Trash2 size={18}/></button>
                </div>
              ))}
              <button onClick={() => setItems([...items, {id: Date.now().toString(), description: '', quantity: 1, price: 0}])} className="app-btn app-btn-secondary w-full">
                <Plus size={18}/> {t('addLineItem')}
              </button>
            </FormSection>

            <FormSection title={tInvoice('signature')} icon={<PenTool size={20}/>}>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{t('signatureChooseMethod')}</p>
                
                {/* Mode Selection Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('canvas')}
                    className={`px-4 py-2 font-bold text-sm transition-colors ${
                      signatureMode === 'canvas'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <PenTool size={14} className="inline mr-1" /> {t('signatureDrawn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('upload')}
                    className={`px-4 py-2 font-bold text-sm transition-colors ${
                      signatureMode === 'upload'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    📤 {t('signatureUpload')}
                  </button>
                </div>

                {/* Canvas Mode */}
                {signatureMode === 'canvas' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">{t('signatureSignHere')}</p>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                      <SignatureCanvas
                        ref={sigCanvasRef}
                        canvasProps={{
                          className: 'w-full h-40 border border-slate-200 rounded bg-white'
                        }}
                        onEnd={() => {
                          if (sigCanvasRef.current) {
                            setSignature(sigCanvasRef.current.toDataURL());
                            updateDetails('signatureImage', sigCanvasRef.current.toDataURL());
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (sigCanvasRef.current) {
                            sigCanvasRef.current.clear();
                            setSignature('');
                            updateDetails('signatureImage', '');
                          }
                        }}
                        className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        {t('signatureClear')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
                            setSignature(sigCanvasRef.current.toDataURL());
                            updateDetails('signatureImage', sigCanvasRef.current.toDataURL());
                          }
                        }}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        ✓ {t('signatureValidate')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Mode */}
                {signatureMode === 'upload' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">{t('signatureUploadPrompt')}</p>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              setSignature(base64);
                              updateDetails('signatureImage', base64);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        id="signature-upload"
                        className="hidden"
                      />
                      <label htmlFor="signature-upload" className="cursor-pointer">
                        <div className="text-2xl mb-2">📸</div>
                        <p className="font-bold text-slate-700">{t('signatureClickUpload')}</p>
                        <p className="text-xs text-slate-500 mt-1">{t('signatureOrDrag')}</p>
                      </label>
                    </div>
                    {signature && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-bold text-slate-600 mb-2">{t('signaturePreview')}</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={signature} alt="Signature preview" className="h-16 bg-white p-2 rounded border border-slate-200" />
                      </div>
                    )}
                    {signature && (
                      <button
                        type="button"
                        onClick={() => {
                          setSignature('');
                          updateDetails('signatureImage', '');
                        }}
                        className="px-4 py-2 w-full text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        {t('signatureRemove')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </FormSection>
          </div>

          {/* 📄 Preview Column (Sticky) */}
          <div className="lg:sticky lg:top-10">
            {/* Unified toolbar + invoice container */}
            <div className="w-full max-w-[21cm] mx-auto hide-on-print">
              <SmartActionsToolbar
                invoiceNumber={details.number}
                onPdfDownload={downloadPDF}
                variant="inline"
              />
            </div>

            {/* Paper frame - seamlessly connected to toolbar */}
            <div className="rounded-b-xl rounded-t-none border border-slate-200 border-t-0 bg-white shadow-sm">
              <div
                id="invoice-preview"
                className="mx-auto w-full overflow-hidden bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
                style={{ pageBreakInside: 'avoid' }}
              >
                {/* Document */}
                <div className="min-h-[29.7cm] p-10">
                  {/* Header */}
                  <header className="flex items-start justify-between gap-10 border-b border-slate-200 pb-6">
                    <div className={`min-w-0 ${isArabic ? 'order-2 text-end' : 'order-1 text-start'}`}>
                      <p className="text-sm font-semibold text-slate-900">{details.companyName || t('previewNoClient')}</p>
                      {details.companyIce ? (
                        <p className="mt-1 text-xs text-slate-500">ICE: {details.companyIce}</p>
                      ) : null}
                      {details.companyAddress ? (
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{details.companyAddress}</p>
                      ) : null}
                      {details.companyEmail ? (
                        <p className="mt-2 text-sm text-slate-600">{details.companyEmail}</p>
                      ) : null}
                    </div>

                    <div className={`shrink-0 ${isArabic ? 'order-1 text-start' : 'order-2 text-end'}`}>
                      <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                        {tInvoice('invoiceTitle')}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 tabular-nums">#{details.number}</p>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-slate-500">{t('date')}</span>
                          <span className="font-medium text-slate-900 tabular-nums">{details.date}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-slate-500">{t('dueDate')}</span>
                          <span className="font-medium text-slate-900 tabular-nums">{details.dueDate || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Bill to + purpose */}
                  <section className="mt-6 grid grid-cols-2 gap-10">
                    <div className={isArabic ? 'text-end' : 'text-start'}>
                      <p className="text-sm font-semibold text-slate-900">{t('billTo')}</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{details.clientName || t('previewNoClient')}</p>
                      {details.clientIce ? <p className="mt-1 text-xs text-slate-500">ICE: {details.clientIce}</p> : null}
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{details.clientAddress || '—'}</p>
                      {details.clientEmail ? <p className="mt-2 text-sm text-slate-600">{details.clientEmail}</p> : null}
                    </div>

                    <div className={isArabic ? 'text-start' : 'text-end'}>
                      <p className="text-sm font-semibold text-slate-900">{tInvoice('purpose')}</p>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {details.invoicePurpose || t('previewDescriptionPlaceholder')}
                      </p>
                    </div>
                  </section>

                  {/* Items */}
                  <section className="mt-8">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="text-slate-500">
                          <th className={`border-y border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold ${isArabic ? 'text-end' : 'text-start'}`}>
                            {t('description')}
                          </th>
                          <th className="border-y border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-end">
                            {t('qty')}
                          </th>
                          <th className="border-y border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-end">
                            {t('rate')}
                          </th>
                          <th className="border-y border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-end">
                            {t('amount')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const lineTotal = item.price * item.quantity;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className={`border-b border-slate-100 px-4 py-3.5 align-top ${isArabic ? 'text-end' : 'text-start'}`}>
                                <div className="font-medium text-slate-900 leading-relaxed">
                                  {item.description || t('previewDescriptionPlaceholder')}
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-4 py-3.5 text-end tabular-nums text-slate-700">
                                {item.quantity}
                              </td>
                              <td className="border-b border-slate-100 px-4 py-3.5 text-end tabular-nums text-slate-700">
                                {item.price.toFixed(2)} {getCurrencySymbol(details.currency)}
                              </td>
                              <td className="border-b border-slate-100 px-4 py-3.5 text-end tabular-nums font-medium text-slate-900">
                                {lineTotal.toFixed(2)} {getCurrencySymbol(details.currency)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>

                  {/* Totals */}
                  <section className={`mt-10 flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <div className="w-[320px] rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between py-1.5 text-sm text-slate-600">
                        <span>{tInvoice('sousTotalHT')}</span>
                        <span className="tabular-nums">{subtotal.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
                      </div>

                      {details.taxRate > 0 ? (
                        <div className="flex items-center justify-between py-1.5 text-sm text-slate-700">
                          <span className="font-medium">
                            {tInvoice('tvaLabel', { rate: details.taxRate })}
                          </span>
                          <span className="tabular-nums">+{taxAmount.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
                        </div>
                      ) : null}

                      {details.discount > 0 ? (
                        <div className="flex items-center justify-between py-1.5 text-sm text-slate-700">
                          <span className="font-medium">{tInvoice('reductionLabel')}</span>
                          <span className="tabular-nums">-{details.discount.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
                        </div>
                      ) : null}

                      {details.shippingFee > 0 ? (
                        <div className="flex items-center justify-between py-1.5 text-sm text-slate-700">
                          <span className="font-medium">{tInvoice('fraisDePortLabel')}</span>
                          <span className="tabular-nums">+{details.shippingFee.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                        <span>{tInvoice('totalTTCLabel')}</span>
                        <span className="tabular-nums">{totalTTC.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
                      </div>
                    </div>
                  </section>

                  {/* Notes + signature */}
                  <footer className="mt-10 border-t border-slate-200 pt-6">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                      <div className={isArabic ? 'text-end' : 'text-start'}>
                        <p className="text-sm font-semibold text-slate-900">{t('notes')}</p>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {details.notes || t('previewNotesFallback')}
                        </p>
                        <div className="mt-5 rounded-lg bg-slate-50 p-4" style={{ unicodeBidi: 'isolate' }}>
                          <p className="text-xs font-medium text-slate-500">{tInvoice('arreteA')}</p>
                          <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                            {isArabic ? numberToArabicWords(totalTTC) : totalInWords}
                          </p>
                        </div>
                      </div>

                      <div className={isArabic ? 'text-start' : 'text-end'}>
                        <p className="text-sm font-semibold text-slate-900">{tInvoice('signature')}</p>
                        <div className="mt-3 inline-flex w-full justify-end">
                          <div className="w-64 rounded-lg border border-dashed border-slate-300 bg-white p-4">
                            {details.signatureImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={details.signatureImage} alt={tInvoice('signature')} className="h-12 w-full object-contain" />
                            ) : (
                              <div className="h-12" />
                            )}
                            <div className="mt-3 h-px w-full bg-slate-200" />
                            <p className="mt-2 text-xs text-slate-500">{tInvoice('signature')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}