"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Check,
  Download,
  Plus,
  Trash2,
  Building2,
  User,
  Settings2,
  FileText,
  Palette,
  PenTool
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Tajawal } from 'next/font/google';
import { numberToArabicWords } from '@/lib/numberToArabic';
import SmartActionsToolbar from './SmartActionsToolbar';

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

// --- Number to Words Functions ---
const frenchUnits = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const frenchTeens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const frenchTens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro';

  let result = '';
  let n = Math.floor(num);

  // Handle millions
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    result += numberToFrenchWords(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
    n %= 1000000;
  }

  // Handle thousands
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) result += 'mille ';
    else result += numberToFrenchWords(thousands) + ' mille ';
    n %= 1000;
  }

  // Handle hundreds
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    if (hundreds === 1) result += 'cent ';
    else result += frenchUnits[hundreds] + ' cent' + (hundreds > 1 ? 's' : '') + ' ';
    n %= 100;
  }

  // Handle tens and units
  if (n >= 20) {
    const tens = Math.floor(n / 10);
    const units = n % 10;
    result += frenchTens[tens];
    if (units > 0) {
      if (tens === 7 || tens === 9) {
        result += '-' + frenchTeens[units];
      } else {
        result += '-' + frenchUnits[units];
      }
    }
  } else if (n >= 10) {
    result += frenchTeens[n - 10];
  } else if (n > 0) {
    result += frenchUnits[n];
  }

  return result.trim();
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
function FormSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">{icon}</div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-[13px] font-bold text-slate-500 mr-1 font-tajawal">{label}</span>
      {children}
    </label>
  );
}

export default function InvoiceForm() {
  const t = useTranslations('Form');
  const tHome = useTranslations('HomePage');
  const tInvoice = useTranslations('Invoice');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [details, setDetails] = useState<InvoiceDetails>({
    companyName: '', companyEmail: '', companyAddress: '', companyLogo: '',
    clientName: '', clientEmail: '', clientAddress: '',
    number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: '', currency: 'MAD', taxRate: 0, discount: 0, shippingFee: 0, notes: '', invoicePurpose: '',
    companyIce: '', clientIce: '', signatureImage: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, price: 0 }]);
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue color
  const [signature, setSignature] = useState<string>('');
  const [signatureMode, setSignatureMode] = useState<'canvas' | 'upload'>('canvas');

  const sigCanvasRef = useRef<SignatureCanvas>(null);

  useEffect(() => { setMounted(true); }, []);

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
    setIsExporting(true);
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(`${details.number}.pdf`);
    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  if (!mounted) return null;

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-tajawal";

  return (
    <div className={`min-h-screen bg-[#fcfdfe] pb-20 ${isArabic ? tajawal.variable : ''} font-arabic`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-[1400px] px-6 pt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-10 items-start">
          
          {/* 🛠️ Editor Column */}
          <div className="space-y-6">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 -mx-6 px-6 py-4 border-b border-slate-100 mb-8">
              <h1 className="text-3xl font-black text-slate-900">Create Invoice</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSection title={t('companyInfo')} icon={<Building2 size={20}/>}>
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
                  }} className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}/>
                </Field>
                <Field label={t('yourCompanyName')}><input className={inputClass} value={details.companyName} onChange={e => updateDetails('companyName', e.target.value)}/></Field>
                <Field label={t('email')}><input className={inputClass} value={details.companyEmail} onChange={e => updateDetails('companyEmail', e.target.value)}/></Field>
                <Field label="ICE (15 chiffres)"><input className={inputClass} value={details.companyIce || ''} onChange={e => updateDetails('companyIce', e.target.value)} maxLength={15} placeholder="Ex: 001122334455667"/></Field>
                <Field label={t('companyAddress')}><textarea className={`${inputClass} h-20`} value={details.companyAddress} onChange={e => updateDetails('companyAddress', e.target.value)}/></Field>
              </FormSection>

              <FormSection title={t('clientInfo')} icon={<User size={20}/>}>
                <Field label={t('clientName')}><input className={inputClass} value={details.clientName} onChange={e => updateDetails('clientName', e.target.value)}/></Field>
                <Field label={t('email')}><input className={inputClass} value={details.clientEmail} onChange={e => updateDetails('clientEmail', e.target.value)}/></Field>
                <Field label="ICE Client (optionnel)"><input className={inputClass} value={details.clientIce || ''} onChange={e => updateDetails('clientIce', e.target.value)} maxLength={15} placeholder="ICE du client"/></Field>
                <Field label={t('clientAddress')}><textarea className={`${inputClass} h-20`} value={details.clientAddress} onChange={e => updateDetails('clientAddress', e.target.value)}/></Field>
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
              <Field label={tInvoice('purpose')}><input type="text" className={inputClass} value={details.invoicePurpose || ''} onChange={e => updateDetails('invoicePurpose', e.target.value)} placeholder="ex: Prestation de Service, Vente de Produit"/></Field>
              <Field label={tInvoice('notes')}><textarea className={`${inputClass} h-20`} value={details.notes} onChange={e => updateDetails('notes', e.target.value)} placeholder="Notes ou remarques (optionnel)"/></Field>
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
                <div key={item.id} className="flex gap-3 mb-3 items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex-grow"><input placeholder={t('description')} className={inputClass} value={item.description} onChange={e => updateItem(item.id, {description: e.target.value})}/></div>
                  <div className="w-20"><input type="number" placeholder="Qty" className={inputClass} value={item.quantity} onChange={e => updateItem(item.id, {quantity: Number(e.target.value)})}/></div>
                  <div className="w-24"><input type="number" placeholder="Price" className={inputClass} value={item.price} onChange={e => updateItem(item.id, {price: Number(e.target.value)})}/></div>
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                </div>
              ))}
              <button onClick={() => setItems([...items, {id: Date.now().toString(), description: '', quantity: 1, price: 0}])} className="flex items-center gap-2 text-indigo-600 font-bold mt-2 hover:underline">
                <Plus size={18}/> {t('addLineItem')}
              </button>
            </FormSection>

            <FormSection title={tInvoice('signature')} icon={<PenTool size={20}/>}>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Choisissez une méthode pour ajouter la signature</p>
                
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
                    <PenTool size={14} className="inline mr-1" /> Signature Dessinée
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
                    📤 Importer
                  </button>
                </div>

                {/* Canvas Mode */}
                {signatureMode === 'canvas' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Signez ci-dessous pour valider la facture</p>
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
                        Effacer
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
                        ✓ Valider la signature
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Mode */}
                {signatureMode === 'upload' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Importer une image de signature (PNG, JPG)</p>
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
                        <p className="font-bold text-slate-700">Cliquez pour importer</p>
                        <p className="text-xs text-slate-500 mt-1">ou glissez votre image</p>
                      </label>
                    </div>
                    {signature && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-bold text-slate-600 mb-2">Aperçu:</p>
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
                        Supprimer la signature
                      </button>
                    )}
                  </div>
                )}
              </div>
            </FormSection>
          </div>

          {/* 📄 Preview Column (Sticky) */}
          <div className="lg:sticky lg:top-10">
            <SmartActionsToolbar
              invoiceNumber={details.number}
              onPdfDownload={downloadPDF}
            />

            <div id="invoice-preview" className="bg-white aspect-[1/1.414] shadow-2xl rounded-sm p-10 border border-slate-100 flex flex-col overflow-hidden" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter italic" style={{ color: themeColor }}>{tInvoice('invoiceTitle')}</h2>
                  <p className="text-slate-400 font-mono text-sm">#{details.number}</p>
                </div>
                <div className="text-start">
                  <p className="font-bold text-lg" style={{ color: themeColor }}>{details.companyName || 'Your Company'}</p>
                  {details.companyIce && <p className="text-[10px] text-slate-500">ICE: {details.companyIce}</p>}
                  <p className="text-[10px] text-slate-400 max-w-[150px] leading-tight">{details.companyAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12">
                <div>
                  <p className="text-[10px] font-bold uppercase mb-2 tracking-widest" style={{ color: themeColor }}>{t('billTo')}</p>
                  <p className="font-bold text-slate-800">{details.clientName || 'Client Name'}</p>
                  {details.clientIce && <p className="text-[10px] text-slate-500">ICE: {details.clientIce}</p>}
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{details.clientAddress}</p>
                </div>
                <div className="text-start space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</p>
                  <p className="text-sm font-bold">{details.date}</p>
                  {details.dueDate && <><p className="text-[10px] font-bold text-slate-400 uppercase pt-2 tracking-widest">{t('dueDate')}</p><p className="text-sm font-bold">{details.dueDate}</p></>}
                </div>
              </div>

              {/* Items Table with HT/TTC Distinction */}
              <table className="w-full mb-8">
                <thead className="border-b-2 border-slate-900">
                  <tr className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                    <th className="py-3 text-start">{t('description')}</th>
                    <th className="py-3 text-center w-16">{t('qty')}</th>
                    <th className="py-3 text-center w-20">Prix HT</th>
                    <th className="py-3 text-end w-24">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(item => (
                    <tr key={item.id} className="text-[10px] page-break-inside-avoid">
                      <td className="py-3 font-medium text-slate-700">{item.description || '...'}</td>
                      <td className="py-3 text-center text-slate-500">{item.quantity}</td>
                      <td className="py-3 text-center text-slate-600">{item.price.toFixed(2)} {getCurrencySymbol(details.currency)}</td>
                      <td className="py-3 text-end font-bold">{(item.price * item.quantity).toFixed(2)} {getCurrencySymbol(details.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t-4 flex justify-between items-start gap-8 print:fixed print:bottom-0 print:left-0 print:right-0 print:bg-white print:p-4 print:border-t print:border-slate-200" style={{ borderTopColor: themeColor }}>
          {/* Left: Notes & Signature */}
          <div className="flex-1 max-w-[280px]">
            <div className="mb-6">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">{t('notes')}</p>
              <p className="text-[9px] text-slate-500 italic leading-tight">{details.notes || 'Thank you for your business.'}</p>
            </div>
            
            {/* Arabic/French Totals in Words */}
            <div className="mb-6 p-3 bg-slate-50 rounded" style={{ unicodeBidi: 'isolate' }}>
              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 tracking-widest">{tInvoice('arreteA')}</p>
              <p className="text-[9px] text-slate-600 italic leading-tight font-medium">
                {isArabic ? numberToArabicWords(totalTTC) : totalInWords}
              </p>
            </div>

            {/* Signature Display */}
            {details.signatureImage && (
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Signature</p>
                <img src={details.signatureImage} alt="Signature" className="h-10 max-w-[150px]" />
              </div>
            )}
          </div>

          {/* Right: Totals Breakdown (HT/TTC) */}
          <div className="w-56 space-y-2 text-end">
            <div className="flex justify-between text-[10px] font-bold text-slate-600">
              <span>{tInvoice('sousTotalHT')}</span>
              <span>{subtotal.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
            </div>
            
            {details.taxRate > 0 && (
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>{tInvoice('tvaLabel').replace('{rate}', details.taxRate.toString())}</span>
                <span className="text-amber-600">+{taxAmount.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
              </div>
            )}
            
            {details.discount > 0 && (
              <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                <span>{tInvoice('reductionLabel')}</span>
                <span>-{details.discount.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
              </div>
            )}
            
            {details.shippingFee > 0 && (
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>{tInvoice('fraisDePortLabel')}</span>
                <span>+{details.shippingFee.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm font-black text-slate-900 border-t-2 border-slate-200 pt-2 mt-2">
              <span>{tInvoice('totalTTCLabel')}</span>
              <span style={{ color: themeColor }}>{totalTTC.toFixed(2)} {getCurrencySymbol(details.currency)}</span>
            </div>
          </div>
        </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}