// تعريف واجهة المنتجات داخل الفاتورة
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

// تعريف واجهة البيانات الكاملة للفاتورة
export interface InvoiceData {
  sender: {
    name: string;
    address: string;
    email: string;
    logo?: string;
  };
  recipient: {
    name: string;
    address: string;
    email: string;
  };
  details: {
    number: string;
    date: string;
    dueDate: string;
    currency: string;
    taxRate: number;
    subject: string; // ضروري لحل خطأ Template
  };
  items: InvoiceItem[];
}