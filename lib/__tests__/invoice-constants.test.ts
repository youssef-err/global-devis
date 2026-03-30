import { describe, it, expect } from 'vitest';
import { createId, createInvoiceNumber, today, sanitizeInvoice } from '../invoice/constants';
import type { InvoiceData } from '@/types/invoice';

describe('createId', () => {
  it('returns a non-empty string', () => {
    expect(typeof createId()).toBe('string');
    expect(createId().length).toBeGreaterThan(0);
  });
});

describe('createInvoiceNumber', () => {
  it('returns string matching /^INV-\\d{4}$/', () => {
    expect(createInvoiceNumber()).toMatch(/^INV-\d{4}$/);
  });
});

describe('today', () => {
  it('returns today\'s date string in YYYY-MM-DD format', () => {
    const result = today();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toISOString().split('T')[0]);
  });
});

describe('sanitizeInvoice', () => {
  const baseInvoice: InvoiceData = {
    sender: { name: 'Test Co', address: '123 Main St', email: 'test@test.com' },
    recipient: { name: 'Client', address: '456 Client Ave', email: 'client@test.com' },
    details: {
      id: 'test-id',
      number: 'INV-1234',
      date: '2026-01-01',
      dueDate: '',
      currency: 'MAD',
      taxRate: 20,
      subject: 'Test Invoice',
      status: 'draft',
      template: 'classic',
    },
    items: [{ id: 'item-1', description: 'Service', quantity: 1, price: 100 }],
  };

  it('preserves existing valid fields', () => {
    const result = sanitizeInvoice(baseInvoice);
    expect(result.sender.name).toBe('Test Co');
    expect(result.recipient.name).toBe('Client');
    expect(result.details.number).toBe('INV-1234');
    expect(result.details.taxRate).toBe(20);
  });

  it('fills missing fields with defaults', () => {
    const minimal: InvoiceData = {
      sender: { name: '', address: '', email: '' },
      recipient: { name: '', address: '', email: '' },
      details: {
        id: 'x',
        number: 'INV-0000',
        date: '',
        dueDate: '',
        currency: 'MAD',
        taxRate: 0,
        subject: '',
        status: 'draft',
        template: 'classic',
      },
      items: [],
    };
    const result = sanitizeInvoice(minimal);
    // items should default to one item when empty
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    // status and template should have defaults
    expect(result.details.status).toBe('draft');
    expect(result.details.template).toBe('classic');
  });

  it('preserves items when provided', () => {
    const result = sanitizeInvoice(baseInvoice);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].description).toBe('Service');
  });
});
