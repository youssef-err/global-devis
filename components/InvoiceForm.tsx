'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useInvoice } from '@/hooks/useInvoice';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import CompanyInfoSection from '@/components/form/CompanyInfoSection';
import ClientInfoSection from '@/components/form/ClientInfoSection';
import InvoiceDetailsSection from '@/components/form/InvoiceDetailsSection';
import ItemsSection from '@/components/form/ItemsSection';
import PricingSection from '@/components/form/PricingSection';
import TopBar from '@/components/layout/TopBar';
import InvoiceHistoryList from '@/components/layout/InvoiceHistoryList';
import PreviewPanel from '@/components/preview/PreviewPanel';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export default function InvoiceForm() {
  const router = useRouter();
  const locale = useLocale();
  const { user, signOut } = useAuth();
  const { toast, dismiss } = useToast();
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const {
    data, history, lang, zoom, isExporting, totals,
    setLang, setZoom, updateSender, updateRecipient, updateDetails,
    addItem, updateItem, removeItem, resetInvoice,
    saveInvoiceToHistory, loadInvoiceFromHistory, deleteInvoiceFromHistory,
    duplicateFromHistory, duplicateCurrentInvoice, exportPdf,
    syncStatus, lastSyncedAt, syncError,
  } = useInvoice();

  const handleLogout = useCallback(async () => {
    await signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  }, [signOut, router, locale]);

  const handleSave = useCallback(() => {
    saveInvoiceToHistory();
    trackEvent(AnalyticsEvents.FORM_COMPLETE);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
    toast('Invoice saved', 'success');
  }, [saveInvoiceToHistory, toast]);

  const handleExport = useCallback(async () => {
    const id = toast('Generating PDF…', 'loading', 0);
    try {
      await exportPdf();
      dismiss(id);
      toast('PDF downloaded!', 'success');
      trackEvent(AnalyticsEvents.PDF_DOWNLOAD);
    } catch {
      dismiss(id);
      toast('Export failed — please try again', 'error');
    }
  }, [exportPdf, toast, dismiss]);

  const clearItemFocus = useCallback(() => setFocusItemId(null), []);

  const handleAddLine = useCallback(() => {
    const id = addItem();
    setFocusItemId(id);
  }, [addItem]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSave]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        lang={lang}
        onChangeLang={setLang}
        onSave={handleSave}
        onReset={resetInvoice}
        onDuplicate={duplicateCurrentInvoice}
        onLogout={handleLogout}
        userEmail={user?.email ?? null}
        savedFlash={savedFlash}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        syncError={syncError}
      />

      {/* Main two-column grid */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 py-8 xl:grid-cols-[280px_1fr]">

        {/* Sticky sidebar */}
        <div className="xl:sticky xl:top-20 xl:self-start animate-fade-in">
          <InvoiceHistoryList
            records={history}
            activeInvoiceId={data.details.id}
            onLoad={loadInvoiceFromHistory}
            onDelete={deleteInvoiceFromHistory}
            onDuplicate={duplicateFromHistory}
            onCreateFirst={resetInvoice}
          />
        </div>

        {/* Form column */}
        <div className="flex flex-col gap-4">
          <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
            <CompanyInfoSection sender={data.sender} onUpdate={updateSender} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '40ms' }}>
            <ClientInfoSection recipient={data.recipient} onUpdate={updateRecipient} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
            <InvoiceDetailsSection details={data.details} onUpdate={updateDetails} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '120ms' }}>
            <ItemsSection
              items={data.items}
              onAddLine={handleAddLine}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              focusDescriptionItemId={focusItemId}
              onFocusDescriptionHandled={clearItemFocus}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
            <PricingSection details={data.details} totals={totals} onUpdateDetails={updateDetails} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <PreviewPanel
              data={data}
              totals={totals}
              lang={lang}
              zoom={zoom}
              setZoom={setZoom}
              isExporting={isExporting}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
