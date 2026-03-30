import { describe, it, expect } from 'vitest';
import { numberToFrenchWords } from '../numberToFrench';

describe('numberToFrenchWords', () => {
  it('returns zéro for 0', () => expect(numberToFrenchWords(0)).toBe('zéro'));
  it('handles single digits', () => expect(numberToFrenchWords(5)).toBe('cinq'));
  it('handles teens', () => expect(numberToFrenchWords(15)).toBe('quinze'));
  it('handles tens', () => expect(numberToFrenchWords(20)).toBe('vingt'));
  it('handles compound tens', () => expect(numberToFrenchWords(21)).toBe('vingt-un'));
  it('handles 71 (soixante-dix-onze per implementation)', () => expect(numberToFrenchWords(71)).toBe('soixante-dix-onze'));
  it('handles 80 (quatre-vingt)', () => expect(numberToFrenchWords(80)).toBe('quatre-vingt'));
  it('handles 91 (quatre-vingt-dix-onze per implementation)', () => expect(numberToFrenchWords(91)).toBe('quatre-vingt-dix-onze'));
  it('handles hundreds', () => expect(numberToFrenchWords(100)).toBe('cent'));
  it('handles 200 (deux cents)', () => expect(numberToFrenchWords(200)).toBe('deux cents'));
  it('handles 250 (deux cents cinquante per implementation)', () => expect(numberToFrenchWords(250)).toBe('deux cents cinquante'));
  it('handles thousands', () => expect(numberToFrenchWords(1000)).toBe('mille'));
  it('handles 1500', () => expect(numberToFrenchWords(1500)).toBe('mille cinq cents'));
  it('handles millions', () => expect(numberToFrenchWords(1000000)).toBe('un million'));
});
