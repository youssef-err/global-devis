'use client';

import { ChangeEvent } from 'react';
import { CompanyInfo } from '@/types/invoice';
import { useTranslations } from 'next-intl';

interface Props {
  sender: CompanyInfo;
  onUpdate: (data: Partial<CompanyInfo>) => void;
}

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 transition-colors hover:border-slate-300 focus:border-slate-400 focus:outline-none focus:ring-0';

export default function CompanyInfoSection({ sender, onUpdate }: Props) {
  const t = useTranslations('Form');

  const handle = (e: ChangeEvent<HTMLInputElement>) =>
    onUpdate({ [e.target.name]: e.target.value });

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-medium text-slate-900">{t('companyInfo')}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-slate-400">{t('yourCompanyName')}</label>
          <input type="text" name="name" value={sender.name} onChange={handle} className={field} placeholder="Acme Inc." />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('email')}</label>
          <input type="email" name="email" value={sender.email} onChange={handle} className={field} placeholder="hello@acme.com" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t('companyAddress')}</label>
          <input type="text" name="address" value={sender.address} onChange={handle} className={field} placeholder="123 Main St" />
        </div>
      </div>
    </div>
  );
}
