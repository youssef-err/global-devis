import { InvoiceData, InvoiceTotals } from '@/types/invoice';

export interface TemplateProps {
  data: InvoiceData;
  totals: InvoiceTotals;
  lang: 'ar' | 'en';
}

export const FONT_FAMILY_AR = 'Tajawal';
export const FONT_FAMILY_EN = 'Poppins';

export function formatAmount(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function statusLabel(status: InvoiceData['details']['status'], isAr: boolean): string {
  if (isAr) {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'قيد الانتظار';
      case 'paid': return 'مدفوع';
      default: return status;
    }
  }
  switch (status) {
    case 'draft': return 'Draft';
    case 'pending': return 'Pending';
    case 'paid': return 'Paid';
    default: return status;
  }
}

export const getTranslations = (isAr: boolean, taxLabel: string) => ({
  invoice: isAr ? 'فاتورة' : 'Invoice',
  subjectFallback: isAr ? 'بدون موضوع' : 'No subject',
  client: isAr ? 'العميل' : 'Client',
  issue: isAr ? 'تاريخ الإصدار' : 'Issue date',
  due: isAr ? 'تاريخ الاستحقاق' : 'Due date',
  desc: isAr ? 'الوصف' : 'Description',
  qty: isAr ? 'الكمية' : 'Qty',
  price: isAr ? 'الثمن' : 'Price',
  amount: isAr ? 'المبلغ' : 'Amount',
  subtotal: isAr ? 'المجموع الفرعي' : 'Subtotal',
  tax: taxLabel,
  total: isAr ? 'الإجمالي' : 'Total',
  status: isAr ? 'الحالة' : 'Status'
});
