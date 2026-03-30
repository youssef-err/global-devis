'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Printer, Share2, Download, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartActionsToolbarProps {
  invoiceNumber?: string;
  onPdfDownload?: () => void;
  variant?: 'floating' | 'inline';
}

// Web Share API is already declared in TypeScript DOM lib

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export default function SmartActionsToolbar({ invoiceNumber, onPdfDownload, variant = 'floating' }: SmartActionsToolbarProps) {
  const t = useTranslations('Invoice');
  const tShare = useTranslations('Invoice.share');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData: ShareData = {
      title: tShare('title', { invoiceNumber: invoiceNumber || 'INV-2024' }),
      text: tShare('text', { invoiceNumber: invoiceNumber || 'INV-2024' }),
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

  const isInline = variant === 'inline';

  const toolbarContent = (
    <div
      className={`flex items-center justify-between gap-3 md:gap-4 p-3 md:p-5 ${
        isInline
          ? 'rounded-t-xl rounded-b-none bg-white border border-slate-200 border-b-0 shadow-sm'
          : 'rounded-2xl backdrop-blur-2xl bg-white/80 border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Left Section: Title */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-105`}>
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm md:text-base font-bold tracking-tight text-slate-900">
            {t('previewTitle') || 'Invoice Preview'}
          </h3>
          <p className="text-[10px] md:text-xs font-semibold text-slate-500/80 uppercase tracking-wider">
            {invoiceNumber || 'INV-2024-001'}
          </p>
        </div>
      </div>

      {/* Right Section: Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-xl active:scale-95"
          title={t('print') || 'Print Invoice'}
        >
          <Printer size={16} />
          <span className="text-xs md:text-sm font-semibold hidden sm:inline">
            {t('print') || 'Print'}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-95"
          title={t('shareLabel') || 'Share Invoice'}
        >
          <Share2 size={16} />
          <span className="text-xs md:text-sm font-semibold hidden sm:inline">
            {t('shareLabel') || 'Share'}
          </span>
        </button>

        {/* PDF Download Button */}
        <button
          onClick={handlePdfDownload}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 active:scale-95"
          title={t('downloadPdf') || 'Download PDF'}
        >
          <Download size={16} />
          <span className="text-xs md:text-sm font-semibold hidden sm:inline">
            {t('downloadPdf')}
          </span>
        </button>
      </div>
    </div>
  );

  if (isInline) {
    return (
      <>
        <div className="w-full hide-on-print">
          {toolbarContent}
        </div>

        {/* Copy Link Toast Notification */}
        <AnimatePresence>
          {showCopyToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: 10, x: '-50%', scale: 0.95 }}
              className="fixed bottom-10 left-1/2 z-[60] hide-on-print"
            >
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={14} />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {t('linkCopied') || 'Link copied to clipboard!'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      {/* Smart Actions Toolbar - Floating variant */}
      <div className="fixed top-4 md:top-6 start-4 end-4 md:start-6 md:end-6 z-40 hide-on-print pointer-events-none">
        <div className="mx-auto max-w-[21cm] pointer-events-auto">
          {toolbarContent}
        </div>
      </div>

      {/* Copy Link Toast Notification */}
      <AnimatePresence>
        {showCopyToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 10, x: '-50%', scale: 0.95 }}
            className="fixed bottom-10 left-1/2 z-[60] hide-on-print"
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/10">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={14} />
              </div>
              <span className="text-sm font-bold tracking-tight">
                {t('linkCopied') || 'Link copied to clipboard!'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from being hidden behind fixed toolbar */}
      <div className="h-20 hide-on-print"></div>
    </>
  );
}