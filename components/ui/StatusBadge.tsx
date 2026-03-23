import { InvoiceStatus } from '@/types/invoice';

const styles: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200'
};

const labels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid'
};

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset transition ${sizeClass} ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
