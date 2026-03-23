'use client';

import { Document, Font } from '@react-pdf/renderer';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

const FONT_FAMILY_AR = 'Tajawal';
const FONT_FAMILY_EN = 'Poppins';

let fontsRegistered = false;

/** Register local fonts once (browser: absolute origin for fetch). */
export function registerInvoiceFonts(): void {
  if (fontsRegistered || typeof window === 'undefined') return;
  const base = window.location.origin;

  Font.register({
    family: FONT_FAMILY_AR,
    fonts: [
      { src: `${base}/fonts/Tajawal-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/Tajawal-Bold.ttf`, fontWeight: 700 }
    ]
  });

  Font.register({
    family: FONT_FAMILY_EN,
    fonts: [
      { src: `${base}/fonts/Poppins-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/Poppins-Bold.ttf`, fontWeight: 700 }
    ]
  });

  fontsRegistered = true;
}

export interface InvoicePdfDocumentProps {
  data: InvoiceData;
  totals: InvoiceTotals;
  lang: 'ar' | 'en';
}

/**
 * Vector PDF invoice for @react-pdf/renderer (selectable text, A4).
 */
export default function InvoicePdfDocument({ data, totals, lang }: InvoicePdfDocumentProps) {
  const template = data.details.template || 'classic';

  return (
    <Document>
      {template === 'modern' && <ModernTemplate data={data} totals={totals} lang={lang} />}
      {template === 'minimal' && <MinimalTemplate data={data} totals={totals} lang={lang} />}
      {template === 'classic' && <ClassicTemplate data={data} totals={totals} lang={lang} />}
    </Document>
  );
}
