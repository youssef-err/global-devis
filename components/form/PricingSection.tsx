'use client';

import { InvoiceDetails, InvoiceTotals } from '@/types/invoice';
import { useTranslations } from 'next-intl';

interface Props {
  details: InvoiceDetails;
  totals: InvoiceTotals;
  onUpdateDetails: (v: Partial<InvoiceDetails>) => void;
}

export default function PricingSection({ details, totals, onUpdateDetails }: Props) {
  const t = useTranslations('Form');

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-medium text-slate-900">{t('pricing')}</p>

      {/* Tax rate input */}
      <div className="mb-5 max-w-[180px]">
        <label className="mb-1 block text-xs text-slate-400">{t('taxRate')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={details.taxRate}
            onChange={(e) => onUpdateDetails({ taxRate: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none hover:border-slate-300 transition-colors"
          />
          <span className="text-sm text-slate-400">%</span>
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-lg bg-slate-50 p-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>{t('subtotal')}</span>
          <span className="tabular-nums">{fmt(totals.subtotal)} {details.currency}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>{details.taxLabel || t('tax')} ({details.taxRate}%)</span>
          <span className="tabular-nums">{fmt(totals.tax)} {details.currency}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
          <span>{t('total')}</span>
          <span className="tabular-nums">{fmt(totals.total)} {details.currency}</span>
        </div>
      </div>
    </div>
  );
}
