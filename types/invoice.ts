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
  ice?: string; // Moroccan ICE (Identifiant Commun de l'Entreprise)
  logo?: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  email: string;
  phone?: string;
  ice?: string; // Moroccan ICE for clients
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
  purpose?: string; // Invoice purpose (Objectif de la facture)
  status: InvoiceStatus;
  template: InvoiceTemplate;
  notes?: string;
  terms?: string;
  companyIce?: string; // Moroccan ICE for company
  clientIce?: string; // Moroccan ICE for client
}

export interface InvoiceData {
  sender: CompanyInfo;
  recipient: ClientInfo;
  details: InvoiceDetails;
  items: InvoiceItem[];
  signature?: string; // Base64 encoded signature image
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
