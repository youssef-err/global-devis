export function numberToArabicWords(amount: number): string {
  const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  if (amount === 0) return "صفر درهم";

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  function parsePart(num: number): string {
    let partWords = "";

    // المئات
    if (num >= 100) {
      partWords += hundreds[Math.floor(num / 100)];
      num %= 100;
      if (num > 0) partWords += " و ";
    }

    // الآحاد والعشرات
    if (num > 0) {
      if (num < 10) {
        partWords += units[num];
      } else if (num < 20) {
        partWords += teens[num - 10];
      } else {
        const unit = num % 10;
        const ten = Math.floor(num / 10);
        partWords += (unit > 0 ? units[unit] + " و " : "") + tens[ten];
      }
    }
    return partWords;
  }

  let finalWords = "";

  // الآلاف (حتى لـ 999 ألف)
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    if (thousands === 1) finalWords += "ألف";
    else if (thousands === 2) finalWords += "ألفان";
    else finalWords += parsePart(thousands) + " ألف";
    
    integerPart %= 1000;
    if (integerPart > 0) finalWords += " و ";
  }

  // المئات والآحاد المتبقية
  if (integerPart > 0 || finalWords === "") {
    finalWords += parsePart(integerPart);
  }

  let result = `أوقفت هذه الفاتورة عند المبلغ الآتي وقدره: ${finalWords} درهم مغربي`;

  if (decimalPart > 0) {
    result += ` و ${parsePart(decimalPart)} سنتيماً`;
  }

  return result + " لا غير.";
}
