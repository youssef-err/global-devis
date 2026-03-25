import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { TemplateProps, getTranslations, formatAmount, statusLabel, FONT_FAMILY_AR, FONT_FAMILY_EN } from './shared';

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 10, color: '#333333', lineHeight: 1.6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, alignItems: 'center' },
  headerRTL: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 40, alignItems: 'center' },
  companyName: { fontSize: 20, fontWeight: 700, color: '#000000', letterSpacing: 1 },
  documentType: { fontSize: 12, color: '#888888', textTransform: 'uppercase', letterSpacing: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#eeeeee', marginBottom: 30 },
  threeCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  blockLabel: { fontSize: 8, color: '#999999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  blockText: { fontSize: 10, color: '#333333', marginBottom: 3 },
  blockTextBold: { fontSize: 10, color: '#000000', fontWeight: 700, marginBottom: 4 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 8 },
  colDesc: { flex: 4, paddingRight: 10 },
  colQty: { width: 40, textAlign: 'center' },
  colPrice: { width: 80, textAlign: 'right' },
  colAmount: { width: 90, textAlign: 'right' },
  colDescRTL: { flex: 4, paddingLeft: 10, textAlign: 'right' },
  colQtyRTL: { width: 40, textAlign: 'center' },
  colPriceRTL: { width: 80, textAlign: 'left' },
  colAmountRTL: { width: 90, textAlign: 'left' },
  totalsWrap: { marginTop: 30, alignItems: 'flex-end', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eeeeee' },
  totalsWrapRTL: { marginTop: 30, alignItems: 'flex-start', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eeeeee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 220, marginBottom: 8 },
  totalLabel: { color: '#666666', fontSize: 10 },
  totalValue: { color: '#333333', fontSize: 10 },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', width: 220, marginTop: 10 },
  grandLabel: { color: '#000000', fontSize: 12, fontWeight: 700 },
  grandValue: { color: '#000000', fontSize: 12, fontWeight: 700 }
});

export default function MinimalTemplate({ data, totals, lang }: TemplateProps) {
  const isAr = lang === 'ar';
  const font = isAr ? FONT_FAMILY_AR : FONT_FAMILY_EN;

  const pageStyle = { ...styles.page, fontFamily: font, direction: isAr ? ('rtl' as const) : ('ltr' as const) };
  
  const header = isAr ? styles.headerRTL : styles.header;
  const threeColDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const tableHeaderDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const tableRowDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const totalRowDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };

  const colDesc = isAr ? styles.colDescRTL : styles.colDesc;
  const colQty = isAr ? styles.colQtyRTL : styles.colQty;
  const colPrice = isAr ? styles.colPriceRTL : styles.colPrice;
  const colAmount = isAr ? styles.colAmountRTL : styles.colAmount;

  const t = getTranslations(isAr, data.details.taxLabel ?? 'Tax');

  return (
    <Page size="A4" style={pageStyle}>
      <View style={header}>
        <Text style={[styles.companyName, { fontFamily: font }]}>{data.sender.name}</Text>
        <Text style={[styles.documentType, { fontFamily: font }]}>{t.invoice}</Text>
      </View>

      <View style={[styles.threeCol, threeColDir]}>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.blockLabel, { fontFamily: font }]}>{t.client}</Text>
          <Text style={[styles.blockTextBold, { fontFamily: font }]}>{data.recipient.name || '—'}</Text>
          <Text style={[styles.blockText, { fontFamily: font }]}>{data.recipient.address || '—'}</Text>
          <Text style={[styles.blockText, { fontFamily: font }]}>{data.recipient.email || '—'}</Text>
        </View>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.blockLabel, { fontFamily: font }]}>Info</Text>
          <Text style={[styles.blockText, { fontFamily: font }]}>No: {data.details.number}</Text>
          <Text style={[styles.blockText, { fontFamily: font }]}>{t.issue}: {data.details.date}</Text>
          <Text style={[styles.blockText, { fontFamily: font }]}>{t.due}: {data.details.dueDate || '—'}</Text>
        </View>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-start' : 'flex-end' }}>
          <Text style={[styles.blockLabel, { fontFamily: font }]}>{t.status}</Text>
          <Text style={[styles.blockTextBold, { fontFamily: font }]}>{statusLabel(data.details.status, isAr)}</Text>
        </View>
      </View>

      <View style={[styles.tableHeader, tableHeaderDir]}>
        <Text style={[colDesc, { fontFamily: font, color: '#999999', fontSize: 9 }]}></Text>
        <Text style={[colQty, { fontFamily: font, color: '#999999', fontSize: 9 }]}>{t.qty}</Text>
        <Text style={[colPrice, { fontFamily: font, color: '#999999', fontSize: 9 }]}>{t.price}</Text>
        <Text style={[colAmount, { fontFamily: font, color: '#999999', fontSize: 9 }]}>{t.amount}</Text>
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
        <View style={[styles.totalRow, totalRowDir]}>
          <Text style={[styles.totalLabel, { fontFamily: font }]}>{t.subtotal}</Text>
          <Text style={[styles.totalValue, { fontFamily: font }]}>{formatAmount(totals.subtotal)} {data.details.currency}</Text>
        </View>
        <View style={[styles.totalRow, totalRowDir]}>
          <Text style={[styles.totalLabel, { fontFamily: font }]}>{t.tax}</Text>
          <Text style={[styles.totalValue, { fontFamily: font }]}>{formatAmount(totals.tax)} {data.details.currency}</Text>
        </View>
        <View style={[styles.grandRow, totalRowDir]}>
          <Text style={[styles.grandLabel, { fontFamily: font }]}>{t.total}</Text>
          <Text style={[styles.grandValue, { fontFamily: font }]}>{formatAmount(totals.total)} {data.details.currency}</Text>
        </View>
      </View>
    </Page>
  );
}
