'use client';

/* eslint-disable @next/next/no-img-element */

import { useTranslations, useLocale } from 'next-intl';
import { Tajawal } from 'next/font/google';
import React from 'react';
// تأكدنا من استيراد الاسم الصحيح للدالة وتصحيح المسار (بدون @/src)
import { numberToArabicWords } from '@/lib/numberToArabic';
import { Printer, Share2, Download, ArrowLeft } from 'lucide-react';

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

  // Calculations
  const subtotal = data?.items?.reduce((sum, item) => sum + (item.qty * item.rate), 0) || 0;
  const taxRate = data?.taxRate ?? 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const discount = data?.discount ?? 0;
  const shippingFee = data?.shippingFee ?? 0;
  const totalTTC = subtotal + taxAmount + shippingFee - discount;

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency?: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'MAD': return isRtl ? t('currencyDirham') : t('currencyDH');
      default: return isRtl ? t('currencyDirham') : t('currencyDH');
    }
  };

  // PDF Download Handler
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
        foreignObjectRendering: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
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

  // Share Handler
  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${data?.invoiceNumber || 'INV-2024-001'}`,
          text: `Invoice from ${data?.senderName || 'Global Devis Studio'}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Print Handler
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Back Handler
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className={`${isRtl ? tajawal.variable : ''} min-h-screen bg-slate-100 py-10 print:bg-white print:p-0`}>
      {/* Print CSS Hack */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { padding-top: 0 !important; }
            .no-print { display: none !important; }
          }
        `
      }} />

      {/* Professional Invoice Document */}
      <div
        id="invoice-document"
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`mx-auto min-h-[29.7cm] w-full max-w-[21cm] bg-white shadow-2xl print:m-0 print:shadow-none ${
          isRtl ? 'font-[family-name:var(--font-tajawal)]' : 'font-sans'
        }`}
      >
        {/* ===== HEADER ===== */}
        <header className="bg-slate-900 text-white">
          <div className="px-12 pt-10 pb-8">
            <div className="flex items-start justify-between">
              {/* Company Info */}
              <div className="flex items-start gap-6">
                {/* Logo */}
                {data?.companyLogo ? (
                  <img src={data.companyLogo} alt="Company Logo" className="h-20 w-20 object-contain rounded-lg border-2 border-slate-700 bg-white" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white text-3xl font-black text-slate-900 shadow-lg">
                    {data?.senderName?.[0] || 'G'}
                  </div>
                )}
                
                <div className="pt-1">
                  <h1 className="text-3xl font-black tracking-tight text-white">
                    {data?.senderName || t('logo')}
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    {data?.purpose || tForm('previewDescriptionPlaceholder')}
                  </p>
                </div>
              </div>

              {/* Invoice Title */}
              <div className="text-end">
                <h2 className="text-5xl font-black uppercase tracking-tighter text-white">
                  {t('previewTitle')}
                </h2>
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-400">{data?.invoiceNumber || 'INV-2024-001'}</span>
                    <span className="text-slate-600 font-bold">#</span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-400">{data?.date || new Date().toLocaleDateString()}</span>
                    <span className="w-16 text-right text-slate-600 font-bold">{tForm('date')}:</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Divider */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        </header>

        {/* ===== ITEMS TABLE ===== */}
        <main className="px-12 py-10">
          {/* Table Header */}
          <div className="mb-0">
            <div className="grid grid-cols-12 bg-slate-100 px-5 py-4 text-xs font-bold uppercase tracking-widest text-slate-600 rounded-t-lg">
              <div className="col-span-7">{tForm('description')}</div>
              <div className="col-span-2 text-center">{tForm('qty')}</div>
              <div className="col-span-3 text-end pe-4">{tForm('rate')} HT</div>
            </div>

            {/* Table Body */}
            <div className="border-x border-b border-slate-200">
              {data?.items && data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center px-5 py-5 border-b border-slate-100 bg-white hover:bg-slate-50/50 transition-colors page-break-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="col-span-7 font-semibold text-slate-800 text-sm leading-relaxed">{item.description}</div>
                    <div className="col-span-2 text-center text-slate-600 text-sm">{item.qty}</div>
                    <div className="col-span-3 text-end pe-4 font-semibold text-slate-900 text-sm">
                      {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol(data?.currency)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-300 italic flex flex-col items-center gap-3 page-break-avoid">
                  <svg className="h-10 w-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">{tForm('previewDescriptionPlaceholder')}</span>
                </div>
              )}
            </div>
          </div>

          {/* ===== PRICING SECTION ===== */}
          <div className="mt-8 page-break-avoid">
            {/* Divider */}
            <div className="border-t-2 border-slate-200 my-8"></div>

            <div className="flex justify-end">
              <div className="w-80 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500 font-medium">{t('subtotalHT')}</span>
                  <span className="text-base font-semibold text-slate-700">
                    {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol(data?.currency)}
                  </span>
                </div>

                {/* Tax */}
                {taxRate > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-500 font-medium">{t('tva')} ({taxRate}%)</span>
                    <span className="text-base font-semibold text-amber-600">
                      +{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol(data?.currency)}
                    </span>
                  </div>
                )}

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-500 font-medium">{t('reduction')}</span>
                    <span className="text-base font-semibold text-emerald-600">
                      -{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol(data?.currency)}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                {shippingFee > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-500 font-medium">{t('fraisDePort')}</span>
                    <span className="text-base font-semibold text-blue-600">
                      +{shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })} {getCurrencySymbol(data?.currency)}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-slate-200 pt-3"></div>

                {/* TOTAL - BIG & BOLD */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {t('totalAmount')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">TTC</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tight leading-none">
                        {totalTTC.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-slate-400 mt-1 font-medium">
                        {getCurrencySymbol(data?.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            {totalTTC > 0 && (
              <div className="mt-8 rounded-lg bg-slate-50 p-5 border border-slate-200" style={{ unicodeBidi: 'isolate' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  {t('amountInWords')}
                </p>
                <p className="text-base font-semibold text-slate-700 leading-relaxed">
                  {isRtl ? numberToArabicWords(totalTTC) : `${totalTTC.toFixed(2)} ${t('currencyDirham')}`}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="mt-auto page-break-avoid print:fixed print:bottom-0 print:left-0 print:right-0 print:bg-white print:p-4 print:border-t print:border-slate-200">
          {/* Footer Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-12"></div>
          
          <div className="px-12 py-8">
            <div className={`grid grid-cols-1 gap-12 ${isRtl ? 'sm:grid-cols-[1fr_200px]' : 'sm:grid-cols-[200px_1fr]'}`}>
              {/* Notes Section */}
              <div className={isRtl ? 'order-2 sm:order-2' : 'order-2 sm:order-1'}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('notes')}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 whitespace-pre-wrap">
                  {data?.notes || tForm('previewNotesFallback')}
                </p>

                {/* Signature Image */}
                {data?.signature && (
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                      {t('signature')}
                    </p>
                    <img
                      src={data.signature}
                      alt="Signature"
                      className="h-14 bg-white border border-slate-200 rounded p-2 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Signature Line */}
              <div className={`flex flex-col ${isRtl ? 'sm:items-start order-1 sm:order-1' : 'sm:items-end order-1 sm:order-2'} justify-end`}>
                <div className="w-56 text-center">
                  <div className="h-16 w-full border-b-2 border-dashed border-slate-300"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mt-2">
                    {t('signature')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Credits */}
          <div className="bg-slate-50 px-12 py-5 text-center border-t border-slate-200 page-break-avoid print:hidden">
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Generated by Global Devis Studio • {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>

      {/* Floating Bottom Action Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999999] pointer-events-auto print:hidden">
        <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 backdrop-blur-md bg-opacity-90">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">{t('edit') || 'تعديل'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors shadow-lg"
          >
            <Printer className="h-4 w-4" />
            <span className="font-medium">{t('print')}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
          >
            <Share2 className="h-4 w-4" />
            <span className="font-medium">{t('share')}</span>
          </button>

          <button
            onClick={handlePdfDownload}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span className="font-medium">{t('downloadPdf')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}