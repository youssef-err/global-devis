'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface InvoiceCTAProps {
  locale: string;
}

export default function InvoiceCTA({ locale }: InvoiceCTAProps) {
  const t = useTranslations('InvoiceCTA');
  const isAr = locale === 'ar';
  
  return (
    <div className="my-10 overflow-hidden rounded-2xl bg-indigo-600 px-6 py-10 shadow-xl sm:px-12 sm:py-16">
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t('title')}
        </h2>
        <p className={`mx-auto mt-6 max-w-xl text-lg leading-relaxed text-indigo-100 ${isAr ? 'text-right' : 'text-center'}`}>
          {t('description')}
        </p>
        <div className="mt-8 flex items-center justify-center gap-x-6">
          <Link
            href={`/${locale}`}
            className="rounded-md bg-white px-5 py-3.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
