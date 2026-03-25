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
  FileText
} from 'lucide-react';

// --- Interfaces ---
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceDetails {
  companyName: string; companyEmail: string; companyAddress: string;
  clientName: string; clientEmail: string; clientAddress: string;
  number: string; date: string; dueDate: string;
  currency: string; taxRate: number; discount: number;
  shippingFee: number; notes: string;
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
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [details, setDetails] = useState<InvoiceDetails>({
    companyName: '', companyEmail: '', companyAddress: '',
    clientName: '', clientEmail: '', clientAddress: '',
    number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: '', currency: 'MAD', taxRate: 0, discount: 0, shippingFee: 0, notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, price: 0 }]);

  useEffect(() => { setMounted(true); }, []);

  // --- Calculations ---
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.price), 0), [items]);
  const taxAmount = (subtotal * details.taxRate) / 100;
  const grandTotal = subtotal + taxAmount + details.shippingFee - details.discount;

  const updateDetails = (key: keyof InvoiceDetails, val: any) => setDetails(prev => ({ ...prev, [key]: val }));
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
    <div className="min-h-screen bg-[#fcfdfe] pb-20 font-arabic" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-[1400px] px-6 pt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-10 items-start">
          
          {/* 🛠️ Editor Column */}
          <div className="space-y-6">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 -mx-6 px-6 py-4 border-b border-slate-100 mb-8">
              <h1 className="text-3xl font-black text-slate-900">Create Invoice</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSection title={t('companyInfo')} icon={<Building2 size={20}/>}>
                <Field label={t('yourCompanyName')}><input className={inputClass} value={details.companyName} onChange={e => updateDetails('companyName', e.target.value)}/></Field>
                <Field label={t('email')}><input className={inputClass} value={details.companyEmail} onChange={e => updateDetails('companyEmail', e.target.value)}/></Field>
                <Field label={t('companyAddress')}><textarea className={`${inputClass} h-20`} value={details.companyAddress} onChange={e => updateDetails('companyAddress', e.target.value)}/></Field>
              </FormSection>

              <FormSection title={t('clientInfo')} icon={<User size={20}/>}>
                <Field label={t('clientName')}><input className={inputClass} value={details.clientName} onChange={e => updateDetails('clientName', e.target.value)}/></Field>
                <Field label={t('email')}><input className={inputClass} value={details.clientEmail} onChange={e => updateDetails('clientEmail', e.target.value)}/></Field>
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
                    {['MAD', 'USD', 'EUR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Field label={t('tax')}><input type="number" className={inputClass} value={details.taxRate} onChange={e => updateDetails('taxRate', Number(e.target.value))}/></Field>
                <Field label={t('discount')}><input type="number" className={inputClass} value={details.discount} onChange={e => updateDetails('discount', Number(e.target.value))}/></Field>
                <Field label={t('shippingFee')}><input type="number" className={inputClass} value={details.shippingFee} onChange={e => updateDetails('shippingFee', Number(e.target.value))}/></Field>
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
          </div>

          {/* 📄 Preview Column (Sticky) */}
          <div className="lg:sticky lg:top-10">
            <div className="flex gap-3 mb-4">
              <button onClick={downloadPDF} className={`flex-grow py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${exportSuccess ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {isExporting ? t('downloadLoading') : exportSuccess ? <Check className="inline ml-2"/> : <Download className="inline ml-2 text-indigo-400"/>}
                {exportSuccess ? t('downloadSuccess') : t('downloadPdf')}
              </button>
            </div>

            <div id="invoice-preview" className="bg-white aspect-[1/1.414] shadow-2xl rounded-sm p-10 border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter italic">INVOICE</h2>
                  <p className="text-slate-400 font-mono text-sm">#{details.number}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-indigo-600">{details.companyName || 'Your Company'}</p>
                  <p className="text-[10px] text-slate-400 max-w-[150px] leading-tight">{details.companyAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12">
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2 tracking-widest">{t('billTo')}</p>
                  <p className="font-bold text-slate-800">{details.clientName || 'Client Name'}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{details.clientAddress}</p>
                </div>
                <div className="text-left space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</p>
                  <p className="text-sm font-bold">{details.date}</p>
                  {details.dueDate && <><p className="text-[10px] font-bold text-slate-400 uppercase pt-2 tracking-widest">{t('dueDate')}</p><p className="text-sm font-bold">{details.dueDate}</p></>}
                </div>
              </div>

              <table className="w-full mb-8">
                <thead className="border-b-2 border-slate-900">
                  <tr className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">
                    <th className="py-3 text-right">{t('description')}</th>
                    <th className="py-3 text-center">{t('qty')}</th>
                    <th className="py-3 text-left">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(item => (
                    <tr key={item.id} className="text-sm">
                      <td className="py-4 font-medium text-slate-700">{item.description || '...'}</td>
                      <td className="py-4 text-center text-slate-500">{item.quantity}</td>
                      <td className="py-4 text-left font-bold">{item.price * item.quantity} {details.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-auto pt-6 border-t-4 border-slate-900 flex justify-between items-start">
                <div className="max-w-[200px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">{t('notes')}</p>
                  <p className="text-[10px] text-slate-500 italic leading-tight">{details.notes || 'Thank you for your business.'}</p>
                </div>
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500"><span>{t('subtotal')}</span><span>{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500"><span>{t('tax')} ({details.taxRate}%)</span><span>+{taxAmount.toFixed(2)}</span></div>
                  {details.discount > 0 && <div className="flex justify-between text-[11px] font-bold text-emerald-600"><span>{t('discount')}</span><span>-{details.discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-2"><span>TOTAL</span><span>{grandTotal.toFixed(2)} {details.currency}</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}