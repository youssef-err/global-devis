'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Printer, Share2, Download, Copy } from 'lucide-react';
import React, { useState } from 'react';

interface SmartActionsToolbarProps {
  invoiceNumber?: string;
  onPdfDownload?: () => void;
}

// Web Share API is already declared in TypeScript DOM lib

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export default function SmartActionsToolbar({ invoiceNumber, onPdfDownload }: SmartActionsToolbarProps) {
  const t = useTranslations('Invoice');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData: ShareData = {
      title: `Invoice ${invoiceNumber || 'INV-2024'} from Global Devis`,
      text: `Check out this invoice: ${invoiceNumber || 'INV-2024'}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share or error occurred
        // eslint-disable-next-line no-console
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handlePdfDownload = () => {
    if (onPdfDownload) {
      onPdfDownload();
    }
  };

  return (
    <>
      {/* Smart Actions Toolbar */}
      <div className="fixed top-4 inset-x-4 z-50 hide-on-print">
        <div className="mx-auto max-w-[21cm]">
          <div
            className="flex items-center justify-between gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Left Section: Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('previewTitle') || 'Invoice Preview'}
                </h3>
                <p className="text-xs text-slate-500">
                  {invoiceNumber || 'INV-2024-001'}
                </p>
              </div>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                title={t('print') || 'Print Invoice'}
              >
                <Printer size={16} />
                <span className="text-sm font-medium hidden sm:inline">
                  {t('print') || 'Print'}
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                title={t('share') || 'Share Invoice'}
              >
                <Share2 size={16} />
                <span className="text-sm font-medium hidden sm:inline">
                  {t('share') || 'Share'}
                </span>
              </button>

              {/* PDF Download Button */}
              <button
                onClick={handlePdfDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                title={t('downloadPdf') || 'Download PDF'}
              >
                <Download size={16} />
                <span className="text-sm font-medium hidden sm:inline">
                  PDF
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Link Toast Notification */}
      {showCopyToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 hide-on-print">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-2xl">
            <Copy size={16} />
            <span className="text-sm font-medium">
              {t('linkCopied') || 'Link copied to clipboard!'}
            </span>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind fixed toolbar */}
      <div className="h-20 hide-on-print"></div>
    </>
  );
}