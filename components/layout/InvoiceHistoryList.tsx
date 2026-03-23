'use client';

import { useMemo, useState } from 'react';
import { InvoiceHistoryRecord, InvoiceStatus } from '@/types/invoice';
import StatusBadge from '@/components/ui/StatusBadge';
import { useTranslations } from 'next-intl';

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | InvoiceStatus;

interface Props {
  records: InvoiceHistoryRecord[];
  activeInvoiceId: string;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCreateFirst: () => void;
}

export default function InvoiceHistoryList({ records, activeInvoiceId, onLoad, onDelete, onDuplicate, onCreateFirst }: Props) {
  const t = useTranslations('History');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => {
        if (statusFilter !== 'all' && r.invoice.details.status !== statusFilter) return false;
        if (!q) return true;
        return r.invoice.details.number.toLowerCase().includes(q) || r.invoice.recipient.name.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return sort === 'newest' ? diff : -diff;
      });
  }, [records, query, sort, statusFilter]);

  const hasRecords = records.length > 0;

  return (
    <aside className="no-print flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-900">{t('title')}</p>
        <p className="mt-0.5 text-xs text-slate-400">{t('subtitle')}</p>
      </div>

      {!hasRecords ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-slate-700">{t('emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-400 max-w-[160px]">{t('emptyDesc')}</p>
          <button
            type="button"
            onClick={onCreateFirst}
            className="mt-4 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
          >
            {t('createFirst')}
          </button>
        </div>
      ) : (
        <>
          {/* Search */}
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-300 focus:border-slate-300 focus:bg-white focus:outline-none transition-colors"
          />

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none"
            >
              <option value="newest">{t('newestFirst')}</option>
              <option value="oldest">{t('oldestFirst')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none"
            >
              <option value="all">{t('all')}</option>
              <option value="draft">{t('draft')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="paid">{t('paid')}</option>
            </select>
          </div>

          {/* List */}
          <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto -mx-1 px-1">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">{t('noMatches')}</p>
            )}
            {filtered.map((record) => {
              const active = record.id === activeInvoiceId;
              return (
                <div
                  key={record.id}
                  className={`group rounded-lg border px-3 py-2.5 transition-all cursor-pointer ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => onLoad(record.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-medium truncate ${active ? 'text-white' : 'text-slate-900'}`}>
                      {record.invoice.details.number}
                    </p>
                    {!active && <StatusBadge status={record.invoice.details.status} />}
                  </div>
                  <p className={`mt-0.5 text-xs truncate ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                    {record.invoice.recipient.name || t('unnamedClient')}
                  </p>

                  {/* Row actions */}
                  <div className={`mt-2 flex gap-2 ${active ? 'flex' : 'hidden group-hover:flex'}`}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDuplicate(record.id); }}
                      className={`text-[11px] ${active ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {t('duplicate')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                      className={`text-[11px] ${active ? 'text-red-300 hover:text-red-100' : 'text-red-400 hover:text-red-600'}`}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
