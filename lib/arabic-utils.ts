import reshape from 'arabic-reshaper';

export function reshapeArabic(text: string): string {
  if (!text) return '';
  try {
    return reshape(text);
  } catch {
    return text;
  }
}

export function reshapeArabicText(text: string | undefined | null): string {
  if (!text) return '';
  return reshapeArabic(text);
}