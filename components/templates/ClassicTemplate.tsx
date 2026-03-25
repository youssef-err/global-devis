import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { TemplateProps, getTranslations, formatAmount, statusLabel, FONT_FAMILY_AR, FONT_FAMILY_EN } from './shared';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, color: '#0f172a', lineHeight: 1.4 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 16, paddingBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 700, color: '#0f172a' },
  meta: { fontSize: 9, color: '#64748b', marginTop: 4 },
  companyBlock: { alignItems: 'flex-end', maxWidth: '45%' },
  companyBlockRTL: { alignItems: 'flex-start', maxWidth: '45%' },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  label: { fontSize: 8, color: '#64748b', marginBottom: 4, fontWeight: 700 },
  value: { fontSize: 10, color: '#0f172a' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8, backgroundColor: '#f8fafc' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 8 },
  colDesc: { flex: 3, paddingHorizontal: 6 },
  colQty: { width: 44, textAlign: 'center', paddingHorizontal: 4 },
  colPrice: { width: 72, textAlign: 'right', paddingHorizontal: 4 },
  colAmount: { width: 80, textAlign: 'right', paddingHorizontal: 4 },
  colDescRTL: { flex: 3, paddingHorizontal: 6, textAlign: 'right' },
  colQtyRTL: { width: 44, textAlign: 'center', paddingHorizontal: 4 },
  colPriceRTL: { width: 72, textAlign: 'left', paddingHorizontal: 4 },
  colAmountRTL: { width: 80, textAlign: 'left', paddingHorizontal: 4 },
  totalsWrap: { marginTop: 20, alignItems: 'flex-end' },
  totalsWrapRTL: { marginTop: 20, alignItems: 'flex-start' },
  totalsBox: { width: 220, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, padding: 12, backgroundColor: '#f8fafc' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalGrand: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  badge: { fontSize: 8, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700 }
});

export default function ClassicTemplate({ data, totals, lang }: TemplateProps) {
  const isAr = lang === 'ar';
  const font = isAr ? FONT_FAMILY_AR : FONT_FAMILY_EN;

  const pageStyle = { ...styles.page, fontFamily: font, direction: isAr ? ('rtl' as const) : ('ltr' as const) };
  const headerCompany = isAr ? styles.companyBlockRTL : styles.companyBlock;
  const titleRowDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
  const twoColDir = isAr ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const };
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
      <View style={[styles.titleRow, titleRowDir]}>
        <View style={{ flex: 1 }}>
          <View style={[titleRowDir, { alignItems: 'center' }]}>
            <Text style={[styles.title, { fontFamily: font }]}>{t.invoice}</Text>
            <Text style={[styles.badge, { fontFamily: font, marginLeft: isAr ? 0 : 8, marginRight: isAr ? 8 : 0 }]}>
              {statusLabel(data.details.status, isAr)}
            </Text>
          </View>
          <Text style={[styles.meta, { fontFamily: font }]}>#{data.details.number}</Text>
          <Text style={[styles.meta, { fontFamily: font, marginTop: 4 }]}>{data.details.subject || t.subjectFallback}</Text>
        </View>
        <View style={headerCompany}>
          <Text style={[styles.value, { fontFamily: font, fontWeight: 700 }]}>{data.sender.name}</Text>
          <Text style={[styles.meta, { fontFamily: font }]}>{data.sender.address}</Text>
          <Text style={[styles.meta, { fontFamily: font }]}>{data.sender.email}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={[styles.twoCol, twoColDir]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { fontFamily: font }]}>{t.client}</Text>
          <Text style={[styles.value, { fontFamily: font, fontWeight: 700 }]}>{data.recipient.name || '—'}</Text>
          <Text style={[styles.meta, { fontFamily: font }]}>{data.recipient.address || '—'}</Text>
          <Text style={[styles.meta, { fontFamily: font }]}>{data.recipient.email || '—'}</Text>
        </View>
        <View style={{ flex: 1, alignItems: isAr ? 'flex-start' : 'flex-end' }}>
          <Text style={[styles.label, { fontFamily: font }]}>{t.issue}</Text>
          <Text style={[styles.value, { fontFamily: font }]}>{data.details.date}</Text>
          <Text style={[styles.label, { fontFamily: font, marginTop: 8 }]}>{t.due}</Text>
          <Text style={[styles.value, { fontFamily: font }]}>{data.details.dueDate || '—'}</Text>
        </View>
      </View>
      <View style={[styles.tableHeader, tableHeaderDir]}>
        <Text style={[colDesc, { fontFamily: font, fontWeight: 700, color: '#475569' }]}>{t.desc}</Text>
        <Text style={[colQty, { fontFamily: font, fontWeight: 700, color: '#475569' }]}>{t.qty}</Text>
        <Text style={[colPrice, { fontFamily: font, fontWeight: 700, color: '#475569' }]}>{t.price}</Text>
        <Text style={[colAmount, { fontFamily: font, fontWeight: 700, color: '#475569' }]}>{t.amount}</Text>
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
            <Text style={{ fontFamily: font, color: '#475569' }}>{t.subtotal}</Text>
            <Text style={{ fontFamily: font, color: '#0f172a' }}>{formatAmount(totals.subtotal)} {data.details.currency}</Text>
          </View>
          <View style={[styles.totalRow, totalRowDir]}>
            <Text style={{ fontFamily: font, color: '#475569' }}>{t.tax}</Text>
            <Text style={{ fontFamily: font, color: '#0f172a' }}>{formatAmount(totals.tax)} {data.details.currency}</Text>
          </View>
          <View style={[styles.totalGrand, totalRowDir]}>
            <Text style={{ fontFamily: font, fontWeight: 700, fontSize: 11 }}>{t.total}</Text>
            <Text style={{ fontFamily: font, fontWeight: 700, fontSize: 11 }}>{formatAmount(totals.total)} {data.details.currency}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
