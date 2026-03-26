'use client';

/* eslint-disable jsx-a11y/control-has-associated-label */

import { useEffect, useRef } from 'react';
import { InvoiceItem } from '@/types/invoice';
import { useTranslations } from 'next-intl';

interface Props {
  items: InvoiceItem[];
  onAddLine: () => void;
  onUpdateItem: (id: string, value: Partial<InvoiceItem>) => void;
  onRemoveItem: (id: string) => void;
  focusDescriptionItemId: string | null;
  onFocusDescriptionHandled: () => void;
}

const cellInput = 'w-full bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none';
const numInput = `${cellInput} text-right tabular-nums`;

export default function ItemsSection({ items, onAddLine, onUpdateItem, onRemoveItem, focusDescriptionItemId, onFocusDescriptionHandled }: Props) {
  const t = useTranslations('Form');
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!focusDescriptionItemId) return;
    const el = refs.current[focusDescriptionItemId];
    if (el) { el.focus(); onFocusDescriptionHandled(); }
  }, [focusDescriptionItemId, onFocusDescriptionHandled, items]);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <p className="text-sm font-medium text-slate-900">{t('items')}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60">
              <th className="px-4 py-2.5 text-start text-xs font-medium text-slate-400 w-full">{t('description')}</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-400 w-20">{t('qty')}</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-400 w-28">{t('rate')}</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-400 w-28">{t('amount')}</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                className={`group border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? '' : ''}`}
              >
                <td className="px-2 py-1">
                  <input
                    ref={(el) => { refs.current[item.id] = el; }}
                    className={cellInput}
                    value={item.description}
                    placeholder={t('description')}
                    onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddLine(); } }}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number" min={0}
                    className={numInput}
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(item.id, { quantity: Number(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number" min={0}
                    className={numInput}
                    value={item.price}
                    onChange={(e) => onUpdateItem(item.id, { price: Number(e.target.value) })}
                  />
                </td>
                <td className="px-4 py-1 text-right tabular-nums text-slate-700 text-sm font-medium">
                  {(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    disabled={items.length === 1}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-300 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-500 group-hover:opacity-100 disabled:pointer-events-none"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <div className="px-4 py-3 border-t border-slate-50">
        <button
          type="button"
          onClick={onAddLine}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
            <path d="M8 2v12M2 8h12" />
          </svg>
          {t('addLineItem')}
        </button>
      </div>
    </div>
  );
}
