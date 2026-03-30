import { describe, it, expect } from 'vitest';
import { numberToArabicWords } from '../numberToArabic';

describe('numberToArabicWords', () => {
  it('returns صفر درهم for 0', () => {
    expect(numberToArabicWords(0)).toBe('صفر درهم');
  });

  it('handles single digit', () => {
    expect(numberToArabicWords(5)).toContain('خمسة');
  });

  it('handles teens', () => {
    expect(numberToArabicWords(15)).toContain('خمسة عشر');
  });

  it('handles tens', () => {
    expect(numberToArabicWords(20)).toContain('عشرون');
  });

  it('handles hundreds', () => {
    expect(numberToArabicWords(100)).toContain('مائة');
  });

  it('handles 200', () => {
    expect(numberToArabicWords(200)).toContain('مائتان');
  });

  it('handles thousands', () => {
    expect(numberToArabicWords(1000)).toContain('ألف');
  });

  it('handles 2000', () => {
    expect(numberToArabicWords(2000)).toContain('ألفان');
  });

  it('handles decimal parts', () => {
    expect(numberToArabicWords(10.5)).toContain('سنتيماً');
  });

  it('ends with لا غير.', () => {
    expect(numberToArabicWords(100)).toMatch(/لا غير\.$/);
  });
});
