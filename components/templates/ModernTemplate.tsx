import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { TemplateProps, getTranslations, formatAmount, statusLabel, FONT_FAMILY_AR, FONT_FAMILY_EN } from './shared';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#1e293b', lineHeight: 1.5 },
  headerBanner: { backgroundColor: '#4f46e5', padding: 30, marginHorizontal: -40, marginTop: -40, marginBottom: 30, color: '#ffffff', flexDirection: 'row', justifyContent: 'space-between' },
  headerBannerRTL: { backgroundColor: '#4f46e5', padding: 30, marginHorizontal: -40, marginTop: -40, marginBottom: 30, color: '#ffffff', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 4 },
  badge: { fontSize: 9, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 700, alignSelf: 'flex-start' },
  badgeRTL: { fontSize: 9, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 700 },
  companyName: { fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 4 },
  companyText: { fontSize: 10, color: '#e0e7ff', opacity: 0.9 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: 6 },
  textDark: { fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 2 },
  textMuted: { fontSize: 10, color: '#64748b' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#4f46e5', paddingVertical: 10, marginBottom: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10 },
  colDesc: { flex: 3, paddingHorizontal: 8 },
  colQty: { width: 50, textAlign: 'center', paddingHorizontal: 4 },
  colPrice: { width: 80, textAlign: 'right', paddingHorizontal: 4 },
  colAmount: { width: 90, textAlign: 'right', paddingHorizontal: 4 },
  colDescRTL: { flex: 3, paddingHorizontal: 8, textAlign: 'right' },
  colQtyRTL: { width: 50, textAlign: 'center', paddingHorizontal: 4 },
  colPriceRTL: { width: 80, textAlign: 'left', paddingHorizontal: 4 },
  colAmountRTL: { width: 90, textAlign: 'left', paddingHorizontal: 4 },
  totalsWrap: { marginTop: 20, alignItems: 'flex-end' },
  totalsWrapRTL: { marginTop: 20, alignItems: 'flex-start' },
  totalsBox: { width: 250, backgroundColor: '#f8fafc', borderRadius: 8, padding: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalGrand: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#e2e8f0' },
  totalLabel: { color: '#64748b', fontSize: 10 },
  totalValue: { color: '#1e293b', fontSize: 10, fontWeight: 700 },
  grandLabel: { color: '#4f46e5', fontSize: 14, fontWeight: 700 },
  grandValue: { color: '#4f46e5', fontSize: 14, fontWeight: 700 }
});

export default function ModernTemplate({ data, totals, lang }: TemplateProps) {
  const isAr = lang === 'ar';
  const font = isAr ? FONT_FAMILY_AR : FONT_FAMILY_EN;

  const pageStyle = { ...styles.page, fontFamily: font, direction: isAr ? ('rtl' as const) : ('ltr' as const) };
  
  const headerBanner = isAr ? styles.headerBannerRTL : styles.headerBanner;
  const twoColDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const tableHeaderDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const tableRowDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const totalRowDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };

  const colDesc = isAr ? styles.colDescRTL : styles.colDesc;
  const colQty = isAr ? styles.colQtyRTL : styles.colQty;
  const colPrice = isAr ? styles.colPriceRTL : styles.colPrice;
  const colAmount = isAr ? styles.colAmountRTL : styles.colAmount;

  const t = getTranslations(isAr, data.details.taxLabel);

  return (
    <Page size="A4" style={pageStyle}>
      <View style={headerBanner}>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.title, { fontFamily: font }]}>{t.invoice}</Text>
          <Text style={[styles.companyText, { fontFamily: font, marginBottom: 8 }]}>#{data.details.number}</Text>
          <Text style={[isAr ? styles.badgeRTL : styles.badge, { fontFamily: font }]}>{statusLabel(data.details.status, isAr)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-start' : 'flex-end' }}>
          <Text style={[styles.companyName, { fontFamily: font }]}>{data.sender.name}</Text>
          <Text style={[styles.companyText, { fontFamily: font }]}>{data.sender.address}</Text>
          <Text style={[styles.companyText, { fontFamily: font }]}>{data.sender.email}</Text>
        </View>
      </View>

      <View style={[styles.twoCol, twoColDir]}>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.sectionTitle, { fontFamily: font }]}>{t.client}</Text>
          <Text style={[styles.textDark, { fontFamily: font }]}>{data.recipient.name || '—'}</Text>
          <Text style={[styles.textMuted, { fontFamily: font }]}>{data.recipient.address || '—'}</Text>
          <Text style={[styles.textMuted, { fontFamily: font }]}>{data.recipient.email || '—'}</Text>
        </View>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-start' : 'flex-end' }}>
          <Text style={[styles.sectionTitle, { fontFamily: font }]}>{t.issue}</Text>
          <Text style={[styles.textDark, { fontFamily: font, marginBottom: 8 }]}>{data.details.date}</Text>
          <Text style={[styles.sectionTitle, { fontFamily: font }]}>{t.due}</Text>
          <Text style={[styles.textDark, { fontFamily: font }]}>{data.details.dueDate || '—'}</Text>
        </View>
      </View>

      <View style={[styles.tableHeader, tableHeaderDir]}>
        <Text style={[colDesc, { fontFamily: font, fontWeight: 700, color: '#4f46e5' }]}>{t.desc}</Text>
        <Text style={[colQty, { fontFamily: font, fontWeight: 700, color: '#4f46e5' }]}>{t.qty}</Text>
        <Text style={[colPrice, { fontFamily: font, fontWeight: 700, color: '#4f46e5' }]}>{t.price}</Text>
        <Text style={[colAmount, { fontFamily: font, fontWeight: 700, color: '#4f46e5' }]}>{t.amount}</Text>
      </View>

      {data.items.map((item) => (
        <View key={item.id} style={[styles.tableRow, tableRowDir]}>
          <Text style={[colDesc, { fontFamily: font }]}>{item.description || '—'}</Text>
          <Text style={[colQty, { fontFamily: font }]}>{String(item.quantity)}</Text>
          <Text style={[colPrice, { fontFamily: font }]}>{formatAmount(item.price)}</Text>
          <Text style={[colAmount, { fontFamily: font, fontWeight: 700 }]}>{formatAmount(item.quantity * item.price)}</Text>
        </View>
      ))}

      <View style={isAr ? styles.totalsWrapRTL : styles.totalsWrap}>
        <View style={styles.totalsBox}>
          <View style={[styles.totalRow, totalRowDir]}>
            <Text style={[styles.totalLabel, { fontFamily: font }]}>{t.subtotal}</Text>
            <Text style={[styles.totalValue, { fontFamily: font }]}>{formatAmount(totals.subtotal)} {data.details.currency}</Text>
          </View>
          <View style={[styles.totalRow, totalRowDir]}>
            <Text style={[styles.totalLabel, { fontFamily: font }]}>{t.tax}</Text>
            <Text style={[styles.totalValue, { fontFamily: font }]}>{formatAmount(totals.tax)} {data.details.currency}</Text>
          </View>
          <View style={[styles.totalGrand, totalRowDir]}>
            <Text style={[styles.grandLabel, { fontFamily: font }]}>{t.total}</Text>
            <Text style={[styles.grandValue, { fontFamily: font }]}>{formatAmount(totals.total)} {data.details.currency}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
