export type InvoiceStatus = 'draft' | 'pending' | 'paid';

export type InvoiceTemplate = 'classic' | 'modern' | 'minimal';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone?: string;
  taxId?: string;
  logo?: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  email: string;
  phone?: string;
}

export interface InvoiceDetails {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  taxLabel?: string;
  subject: string;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  notes?: string;
  terms?: string;
}

export interface InvoiceData {
  sender: CompanyInfo;
  recipient: ClientInfo;
  details: InvoiceDetails;
  items: InvoiceItem[];
}

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface InvoiceHistoryRecord {
  id: string;
  updatedAt: string;
  invoice: InvoiceData;
}
