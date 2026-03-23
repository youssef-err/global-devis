'use client';

import React, { memo } from 'react';
import { InvoiceData, InvoiceTotals } from '@/types/invoice';
import StatusBadge from '@/components/ui/StatusBadge';

interface InvoiceDocumentProps {
  data: InvoiceData;
  totals: InvoiceTotals;
  lang: 'ar' | 'en';
}

function formatAmount(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const InvoiceDocument = memo(function InvoiceDocument({ data, totals, lang }: InvoiceDocumentProps) {
    const isAr = lang === 'ar';

    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="mx-auto w-[210mm] min-h-[297mm] bg-white p-12 text-slate-900"
      >
        <div className="mb-10 flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">{isAr ? 'فاتورة' : 'Invoice'}</h1>
              <StatusBadge status={data.details.status} size="md" />
            </div>
            <p className="mt-1 font-mono text-sm text-slate-500">#{data.details.number}</p>
            <p className="mt-2 text-sm text-slate-600">{data.details.subject || (isAr ? 'بدون موضوع' : 'No subject')}</p>
          </div>
          <div className={`shrink-0 ${isAr ? 'text-left' : 'text-right'}`}>
            <p className="text-sm font-semibold text-slate-900">{data.sender.name}</p>
            <p className="text-sm text-slate-600">{data.sender.address}</p>
            <p className="text-sm text-slate-600">{data.sender.email}</p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-medium text-slate-500">{isAr ? 'العميل' : 'Client'}</p>
            <p className="mt-1 text-base font-medium text-slate-900">{data.recipient.name || '—'}</p>
            <p className="text-sm text-slate-600">{data.recipient.address || '—'}</p>
            <p className="text-sm text-slate-600">{data.recipient.email || '—'}</p>
          </div>
          <div className={isAr ? 'text-left' : 'text-right'}>
            <p className="text-xs font-medium text-slate-500">{isAr ? 'تاريخ الإصدار' : 'Issue date'}</p>
            <p className="mt-1 text-sm text-slate-800">{data.details.date}</p>
            <p className="mt-3 text-xs font-medium text-slate-500">{isAr ? 'تاريخ الاستحقاق' : 'Due date'}</p>
            <p className="mt-1 text-sm text-slate-800">{data.details.dueDate || '—'}</p>
          </div>
        </div>

        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className={`border-y border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 ${isAr ? 'text-right' : 'text-left'}`}>
                {isAr ? 'الوصف' : 'Description'}
              </th>
              <th className="border-y border-slate-200 px-4 py-3 text-center text-xs font-semibold text-slate-600">{isAr ? 'الكمية' : 'Qty'}</th>
              <th className="border-y border-slate-200 px-4 py-3 text-center text-xs font-semibold text-slate-600">{isAr ? 'الثمن' : 'Price'}</th>
              <th className={`border-y border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 ${isAr ? 'text-left' : 'text-right'}`}>
                {isAr ? 'المبلغ' : 'Amount'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                <td className="border-b border-slate-100 px-4 py-3">{item.description || '—'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-center tabular-nums">{item.quantity}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-center tabular-nums">{formatAmount(item.price)}</td>
                <td className={`border-b border-slate-100 px-4 py-3 tabular-nums ${isAr ? 'text-left' : 'text-right'}`}>
                  {formatAmount(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={`mt-10 flex ${isAr ? 'justify-start' : 'justify-end'}`}>
          <div className="w-72 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex justify-between py-1 text-sm text-slate-600">
              <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="tabular-nums">
                {formatAmount(totals.subtotal)} {data.details.currency}
              </span>
            </div>
            <div className="flex justify-between py-1 text-sm text-slate-600">
              <span>{isAr ? 'الضريبة' : 'Tax'}</span>
              <span className="tabular-nums">
                {formatAmount(totals.tax)} {data.details.currency}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <span>{isAr ? 'الإجمالي' : 'Total'}</span>
              <span className="tabular-nums">
                {formatAmount(totals.total)} {data.details.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
});

InvoiceDocument.displayName = 'InvoiceDocument';
export default InvoiceDocument;
