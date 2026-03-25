"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Plus, Trash2, FileText } from 'lucide-react';

// حل مشكلة Typescript: تعريف بنية البيانات
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceDetails {
  id: string; // هادا هو الحل ديال خطأ Property id does not exist
  number: string;
  date: string;
  currency: string;
  clientName: string;
  clientAddress: string;
}

export default function InvoiceForm() {
  const t = useTranslations('Form');

  const [details, setDetails] = useState<InvoiceDetails>({
    id: Math.random().toString(36).substr(2, 9),
    number: 'INV-' + Date.now().toString().slice(-5),
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    clientName: '',
    clientAddress: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);

  const handleDownload = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(`invoice-${details.number}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> {t('invoiceNumber')}: {details.number}
        </h1>
        <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
          <Download size={18} /> {t('downloadPdf')}
        </button>
      </div>

      <div id="invoice-preview" className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-600">{t('clientName')}</label>
            <input 
              className="w-full border-b-2 border-gray-100 focus:border-blue-500 outline-none pb-1"
              onChange={(e) => setDetails({...details, clientName: e.target.value})}
            />
          </div>
          <div className="text-right">
             <label className="block text-sm font-semibold text-gray-600">{t('date')}</label>
             <input type="date" value={details.date} className="text-right outline-none" onChange={(e) => setDetails({...details, date: e.target.value})} />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-2 text-gray-600">{t('description')}</th>
              <th className="py-2 text-center text-gray-600">{t('qty')}</th>
              <th className="py-2 text-right text-gray-600">{t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-4"><input className="w-full outline-none" placeholder="..." /></td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right font-medium">{item.price.toFixed(2)} {details.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}