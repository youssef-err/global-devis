const frenchUnits = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const frenchTeens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const frenchTens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

export function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro';

  let result = '';
  let n = Math.floor(num);

  // Handle millions
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    result += numberToFrenchWords(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
    n %= 1000000;
  }

  // Handle thousands
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) result += 'mille ';
    else result += numberToFrenchWords(thousands) + ' mille ';
    n %= 1000;
  }

  // Handle hundreds
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    if (hundreds === 1) result += 'cent ';
    else result += frenchUnits[hundreds] + ' cent' + (hundreds > 1 ? 's' : '') + ' ';
    n %= 100;
  }

  // Handle tens and units
  if (n >= 20) {
    const tens = Math.floor(n / 10);
    const units = n % 10;
    result += frenchTens[tens];
    if (units > 0) {
      if (tens === 7 || tens === 9) {
        result += '-' + frenchTeens[units];
      } else {
        result += '-' + frenchUnits[units];
      }
    }
  } else if (n >= 10) {
    result += frenchTeens[n - 10];
  } else if (n > 0) {
    result += frenchUnits[n];
  }

  return result.trim();
}
