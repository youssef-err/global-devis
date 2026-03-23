'use client';

import dynamic from 'next/dynamic';

const InvoiceForm = dynamic(() => import('@/components/InvoiceForm'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-96 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  )
});

export default function InvoiceFormLazy() {
  return <InvoiceForm />;
}
