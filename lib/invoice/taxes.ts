export interface TaxConfig {
  country: string;
  taxLabel: string;
  taxRate: number;
  currency: string;
  numberFormat: string;
}

export const TAX_CONFIG: Record<string, TaxConfig> = {
  ar: { country: 'MA', taxLabel: 'TVA', taxRate: 20, currency: 'MAD', numberFormat: 'ar-MA' },
  fr: { country: 'FR', taxLabel: 'TVA', taxRate: 20, currency: 'EUR', numberFormat: 'fr-FR' },
  en: { country: 'US', taxLabel: 'Tax', taxRate: 0, currency: 'USD', numberFormat: 'en-US' },
  es: { country: 'ES', taxLabel: 'IVA', taxRate: 21, currency: 'EUR', numberFormat: 'es-ES' },
  pt: { country: 'PT', taxLabel: 'IVA', taxRate: 23, currency: 'EUR', numberFormat: 'pt-PT' },
  de: { country: 'DE', taxLabel: 'MwSt', taxRate: 19, currency: 'EUR', numberFormat: 'de-DE' },
  it: { country: 'IT', taxLabel: 'IVA', taxRate: 22, currency: 'EUR', numberFormat: 'it-IT' },
  nl: { country: 'NL', taxLabel: 'BTW', taxRate: 21, currency: 'EUR', numberFormat: 'nl-NL' },
  tr: { country: 'TR', taxLabel: 'KDV', taxRate: 20, currency: 'TRY', numberFormat: 'tr-TR' },
  ru: { country: 'RU', taxLabel: 'НДС', taxRate: 20, currency: 'RUB', numberFormat: 'ru-RU' }
};

export const getTaxConfig = (locale: string): TaxConfig => {
  return TAX_CONFIG[locale] || TAX_CONFIG['en'];
};
