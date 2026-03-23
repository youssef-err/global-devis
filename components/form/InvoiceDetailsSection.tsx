'use client';

import { ChangeEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InvoiceDetails } from '@/types/invoice';
import { TAX_CONFIG } from '@/lib/invoice/taxes';

interface Props {
  details: InvoiceDetails;
  onUpdate: (data: Partial<InvoiceDetails>) => void;
}

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors hover:border-slate-300 focus:border-slate-400 focus:outline-none';
const selectField = `${field} cursor-pointer appearance-none`;

export default function InvoiceDetailsSection({ details, onUpdate }: Props) {
  const t = useTranslations('Form');
  const locale = useLocale();

  const handleText = (e: ChangeEvent<HTMLInputElement>) =>
    onUpdate({ [e.target.name]: e.target.value });

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'currency') {
      const entry = Object.entries(TAX_CONFIG).find(([, c]) => c.currency === value)
        ?? Object.entries(TAX_CONFIG).find(([l]) => l === locale);
      const cfg = entry ? entry[1] : TAX_CONFIG['en'];
      onUpdate({ currency: value, taxLabel: cfg.taxLabel, taxRate: cfg.taxRate });
    } else {
      onUpdate({ [name]: value });
    }
  };

  const currencies = [...new Set(Object.values(TAX_CONFIG).map((c) => c.currency))];

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-medium text-slate-900">{t('invoiceDetails')}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('invoiceNumber')}</label>
          <input type="text" name="number" value={details.number} onChange={handleText} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('date')}</label>
          <input type="date" name="date" value={details.date} onChange={handleText} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('dueDate')}</label>
          <input type="date" name="dueDate" value={details.dueDate} onChange={handleText} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('currency')}</label>
          <select name="currency" value={details.currency} onChange={handleSelect} className={selectField}>
            {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('template')}</label>
          <select name="template" value={details.template} onChange={handleSelect} className={selectField}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
