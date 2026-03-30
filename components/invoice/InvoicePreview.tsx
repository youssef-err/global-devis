'use client';

/* eslint-disable @next/next/no-img-element */

import { useTranslations, useLocale } from 'next-intl';
import { Tajawal } from 'next/font/google';
import React from 'react';
import { numberToArabicWords } from '@/lib/numberToArabic';
import { reshapeArabicText } from '@/lib/arabic-utils';
import { Printer, Share2, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/contexts/toast-context';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-tajawal',
});

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
}

interface InvoicePreviewProps {
  data?: {
    purpose?: string;
    notes?: string;
    invoiceNumber?: string;
    date?: string;
    senderName?: string;
    companyLogo?: string;
    items?: InvoiceItem[];
    signature?: string;
    taxRate?: number;
    discount?: number;
    shippingFee?: number;
    currency?: string;
  };
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
  const t = useTranslations('Invoice');
  const tForm = useTranslations('Form');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { toast } = useToast();

  const subtotal = data?.items?.reduce((sum, item) => sum + (item.qty * item.rate), 0) || 0;
  const taxRate = data?.taxRate ?? 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const discount = data?.discount ?? 0;
  const shippingFee = data?.shippingFee ?? 0;
  const totalTTC = subtotal + taxAmount + shippingFee - discount;

  // Currency labels via i18n
  const getCurrency = (): string => isRtl ? t('currencyDirham') : 'MAD';
  const getCurrencySymbol = (): string => isRtl ? t('currencyDH') : 'MAD';

  // All labels via t() — ar.json/Invoice namespace provides Arabic translations
  const getLabel = (key: string): string => t(key);

  const getFormLabel = (key: string): string => tForm(key);

  // Amount in words - 100% Arabic when RTL, French when LTR
  const amountInWords = isRtl 
    ? numberToArabicWords(totalTTC)
    : `${totalTTC.toFixed(2)} ${getCurrency()} (${numberToFrenchWords(totalTTC)})`;

  // French number to words helper
  function numberToFrenchWords(amount: number): string {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];
    
    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);
    
    if (integerPart === 0) return 'zéro dirhams';
    
    let words = integerPart + ' dirhams';
    if (decimalPart > 0) {
      words += ' et ' + decimalPart + ' centimes';
    }
    return words;
  }

  const handlePdfDownload = async () => {
    if (typeof window === 'undefined') return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const invoiceElement = document.getElementById('invoice-document');
      if (!invoiceElement) return;

      const canvas = await html2canvas(invoiceElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          const overrideStyle = clonedDoc.createElement('style');
          overrideStyle.textContent = `
            *, *::before, *::after {
              color: #000000 !important;
              background-color: transparent !important;
              border-color: #000000 !important;
              box-shadow: none !important;
            }
          `;
          clonedDoc.head.insertBefore(overrideStyle, clonedDoc.head.firstChild);
          
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            const colorProps = ['color', 'backgroundColor', 'borderColor', 'boxShadow'];
            
            colorProps.forEach(prop => {
              const value = style.getPropertyValue(prop);
              if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('lab(') || value.includes('color-mix') || value.includes('p3'))) {
                const fallback = prop === 'color' ? '#000000' : (prop === 'backgroundColor' ? '#ffffff' : '#000000');
                el.style.setProperty(prop, fallback, 'important');
              }
            });

            const inline = el.getAttribute('style');
            if (inline && (inline.includes('oklch') || inline.includes('oklab') || inline.includes('lab('))) {
              const cleaned = inline
                .replace(/oklch\([^)]+\)/g, '#000000')
                .replace(/oklab\([^)]+\)/g, '#000000')
                .replace(/lab\([^)]+\)/g, '#000000');
              el.setAttribute('style', cleaned);
            }
          }

          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            if (styleTags[i].textContent?.includes('oklch') || styleTags[i].textContent?.includes('oklab')) {
              styleTags[i].textContent = styleTags[i].textContent!
                .replace(/oklch\([^)]+\)/g, '#000000')
                .replace(/oklab\([^)]+\)/g, '#000000')
                .replace(/lab\([^)]+\)/g, '#000000');
            }
          }
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data?.invoiceNumber || 'invoice'}.pdf`);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: isRtl ? `فاتورة ${data?.invoiceNumber}` : `Facture ${data?.invoiceNumber}`,
          text: isRtl ? `فاتورة من ${data?.senderName}` : `Facture de ${data?.senderName}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('linkCopied'), 'success');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  return (
    <div className={`${isRtl ? tajawal.variable : ''} min-h-screen bg-slate-100 py-10 print:bg-white print:p-0`}>
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { padding-top: 0 !important; }
            .no-print, .print\\:hidden { display: none !important; }
            @page { margin: 0; size: A4; }
          }
        `
      }} />

      {/* A4 Invoice Document */}
      <div
        id="invoice-document"
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`mx-auto w-[210mm] min-h-[297mm] bg-white shadow-2xl print:m-0 print:shadow-none ${
          isRtl ? 'font-[family-name:var(--font-tajawal)]' : 'font-sans'
        }`}
        style={{ 
          pageBreakAfter: 'always',
          direction: isRtl ? 'rtl' : 'ltr',
          unicodeBidi: 'plaintext'
        }}
      >
        {/* HEADER */}
        <header className="px-10 pt-10 pb-6 border-b-2 border-slate-800">
          <div className="flex items-start justify-between">
            {/* Logo & Company - Left for FR, Right for AR */}
            <div className={`flex items-start gap-5 ${isRtl ? 'order-2 text-end' : 'order-1 text-start'}`}>
              {data?.companyLogo ? (
                <img src={data.companyLogo} alt="Logo" className="h-20 w-20 object-contain rounded-lg border border-slate-200" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-900 text-3xl font-black text-white">
                  {data?.senderName?.[0] || 'G'}
                </div>
              )}
              
              <div className="pt-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ unicodeBidi: 'isolate' }}>
                  {isRtl ? reshapeArabicText(data?.senderName) : (data?.senderName || t('logo'))}
                </h1>
                <p className="mt-1 text-sm text-slate-500" style={{ unicodeBidi: 'isolate' }}>
                  {isRtl ? reshapeArabicText(data?.purpose) : (data?.purpose || tForm('previewDescriptionPlaceholder'))}
                </p>
              </div>
            </div>

            {/* Invoice Title & Number - Right for FR, Left for AR */}
            <div className={isRtl ? 'order-1 text-start' : 'order-2 text-end'}>
              <h2 className="text-4xl font-black uppercase tracking-wider text-slate-900">
                {getLabel('previewTitle')}
              </h2>
              <div className="mt-4 space-y-1 text-sm">
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-600 font-bold">#</span>
                  <span className="text-slate-800 font-semibold">{data?.invoiceNumber || 'INV-2024-001'}</span>
                </div>
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-500 font-medium">{getFormLabel('date')}:</span>
                  <span className="text-slate-700">{data?.date || new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PURPOSE & BILL TO */}
        <section className="px-10 py-6 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-10">
            {/* Purpose */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {getLabel('purpose')}
              </h3>
              <p className="text-base font-medium text-slate-800 leading-relaxed" style={{ unicodeBidi: 'isolate' }}>
                {isRtl ? reshapeArabicText(data?.purpose) : (data?.purpose || '—')}
              </p>
            </div>
            
            {/* Bill To */}
            <div className={isRtl ? 'text-start' : 'text-end'}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {getLabel('billTo')}
              </h3>
              <p className="text-base font-semibold text-slate-900" style={{ unicodeBidi: 'isolate' }}>
                {isRtl ? reshapeArabicText(data?.senderName) : (data?.senderName || '—')}
              </p>
            </div>
          </div>
        </section>

        {/* ITEMS TABLE */}
        <main className="px-10 py-6">
          {/* Table Header - Fixed Column Widths */}
          <div className="bg-slate-800 text-white px-4 py-3 rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="col-span-5">{getFormLabel('description')}</div>
              <div className="col-span-2 text-center">{getFormLabel('qty')}</div>
              <div className="col-span-2 text-end pe-4">{getFormLabel('rate')} {isRtl ? 'د.ت' : 'HT'}</div>
              <div className="col-span-3 text-end pe-4">{isRtl ? 'المجموع' : 'Total TTC'}</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="border-x border-b border-slate-200">
            {data?.items && data.items.length > 0 ? (
              data.items.map((item, index) => {
                const lineTotal = item.qty * item.rate;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-slate-100 hover:bg-slate-50"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="col-span-5 text-sm font-medium text-slate-800 leading-relaxed" style={{ unicodeBidi: 'isolate' }}>
                      {isRtl ? reshapeArabicText(item.description) : item.description}
                    </div>
                    <div className="col-span-2 text-center text-sm text-slate-600">{item.qty}</div>
                    <div className="col-span-2 text-end pe-4 text-sm text-slate-700 font-medium">
                      {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                    </div>
                    <div className="col-span-3 text-end pe-4 text-sm font-semibold text-slate-900">
                      {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-300 italic">
                <span className="text-sm">{tForm('previewDescriptionPlaceholder')}</span>
              </div>
            )}
          </div>
        </main>

        {/* PRICING SECTION - Professional Breakdown */}
        <section className="px-10 py-4">
          <div className="flex justify-end">
            <div className="w-72 space-y-3">
              {/* Subtotal HT */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">{getLabel('subtotalHT')}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                </span>
              </div>

              {/* TVA */}
              {taxRate > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">{getLabel('tva')} ({taxRate}%)</span>
                  <span className="text-sm font-semibold text-amber-600">
                    +{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                  </span>
                </div>
              )}

              {/* Discount */}
              {discount > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">{getLabel('reduction')}</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    -{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                  </span>
                </div>
              )}

              {/* Shipping */}
              {shippingFee > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">{getLabel('fraisDePort')}</span>
                  <span className="text-sm font-semibold text-blue-600">
                    +{shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                  </span>
                </div>
              )}

              {/* TOTAL TTC - Big Bold Box */}
              <div className="flex items-center justify-between py-3 bg-slate-800 text-white px-4 rounded-lg mt-2">
                <span className="text-sm font-bold uppercase tracking-wider">{getLabel('totalAmount')}</span>
                <div className="text-end">
                  <span className="text-xl font-black">
                    {totalTTC.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-medium ms-1">{getCurrencySymbol()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FIX #5: Amount in Words - Centered, Language Switch */}
          {totalTTC > 0 && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg" style={{ unicodeBidi: 'isolate' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 text-center">
                {getLabel('amountInWords')}
              </p>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed text-center" style={{ unicodeBidi: 'isolate' }}>
                {isRtl ? reshapeArabicText(amountInWords) : amountInWords}
              </p>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-auto px-10 py-6 border-t border-slate-200" style={{ pageBreakInside: 'avoid' }}>
          <div className="grid grid-cols-2 gap-10">
            {/* Notes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {getLabel('notes')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 whitespace-pre-wrap" style={{ unicodeBidi: 'isolate' }}>
                {isRtl ? reshapeArabicText(data?.notes) : (data?.notes || tForm('previewNotesFallback'))}
              </p>

              {data?.signature && (
                <div className="mt-6" style={{ pageBreakInside: 'avoid' }}>
                  <img src={data.signature} alt="Signature" className="h-16 bg-white border border-slate-200 rounded p-2 shadow-sm" />
                </div>
              )}
            </div>

            {/* Signature & Stamp - Bottom Right */}
            <div className={`flex flex-col justify-end ${isRtl ? 'items-start' : 'items-end'}`} style={{ pageBreakInside: 'avoid' }}>
              <div className="w-64" style={{ pageBreakInside: 'avoid' }}>
                <div className="h-20 border-b-2 border-dashed border-slate-300"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mt-3">
                  {getLabel('signature')}
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Footer Credits */}
        <div className="bg-slate-50 px-10 py-4 text-center border-t border-slate-200">
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Global Devis Studio • {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* FIX #4: Floating Bottom Toolbar - High z-index, properly positioned, RTL-aware */}
      <div 
        className="fixed bottom-8 start-1/2 -translate-x-1/2 z-[999999] pointer-events-auto print:hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className={`flex items-center gap-4 bg-slate-900 text-white rounded-full px-8 py-4 shadow-2xl backdrop-blur-md bg-opacity-95 border border-slate-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 ps-2 pe-3 py-2 hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span className="font-medium text-sm whitespace-nowrap">{t('edit')}</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-600"></div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            <Printer className="h-4 w-4" />
            <span className="font-medium text-sm whitespace-nowrap">{t('print')}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200"
          >
            <Share2 className="h-4 w-4" />
            <span className="font-medium text-sm whitespace-nowrap">{t('shareLabel')}</span>
          </button>

          {/* PDF Download Button */}
          <button
            onClick={handlePdfDownload}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span className="font-medium text-sm whitespace-nowrap">{t('downloadPdf')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}