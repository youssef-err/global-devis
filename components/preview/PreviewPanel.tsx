'use client';

import { memo, useState } from 'react';
import { InvoiceData, InvoiceTotals } from '@/types/invoice';
import { PreviewZoom } from '@/hooks/useInvoice';
import InvoiceDocument from './InvoiceDocument';
import { useTranslations } from 'next-intl';

interface PreviewPanelProps {
  data: InvoiceData;
  totals: InvoiceTotals;
  lang: 'ar' | 'en';
  zoom: PreviewZoom;
  setZoom: (zoom: PreviewZoom) => void;
  isExporting: boolean;
  onExport: () => void;
}

const zoomLevels: PreviewZoom[] = [50, 75, 100];

function PreviewPanelComponent({ data, totals, lang, zoom, setZoom, isExporting, onExport }: PreviewPanelProps) {
  const [printView, setPrintView] = useState(false);
  const t = useTranslations('Preview');

  return (
    <div className={`rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden ${printView ? '' : ''}`}>
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <p className="text-sm font-medium text-slate-900">
          {printView ? t('documentOnly') : t('previewExport')}
        </p>

        <div className="flex items-center gap-1.5">
          {!printView && (
            <>
              {/* Zoom switcher */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 me-1">
                {zoomLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setZoom(level)}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      zoom === level ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPrintView(true)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                {t('printView')}
              </button>
            </>
          )}

          {printView && (
            <>
              <button
                type="button"
                onClick={() => setPrintView(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              >
                {t('exitPrintView')}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {t('systemPrint')}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {t('exporting')}
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" d="M8 2v9M4.5 7.5L8 11l3.5-3.5M2 13h12" />
                </svg>
                {t('downloadPdf')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview canvas */}
      <div
        className={`overflow-auto bg-slate-50 ${printView ? 'min-h-[70vh] p-10' : 'p-6'} print:bg-white print:p-0`}
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <div
          className={`mx-auto flex justify-center ${!printView ? 'transition-transform duration-200 ease-out' : ''}`}
          style={printView ? undefined : {
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: `${100 / (zoom / 100)}%`,
          }}
        >
          <div id="invoice-print-root" className="rounded bg-white shadow-md ring-1 ring-slate-200/50 print:shadow-none print:ring-0">
            <InvoiceDocument data={data} totals={totals} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PreviewPanel = memo(PreviewPanelComponent);
export default PreviewPanel;
