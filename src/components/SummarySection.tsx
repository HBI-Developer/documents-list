import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCurrencies } from "../context/CurrenciesContext";
import { useDeductions } from "../context/DeductionsContext";
import { useDocuments } from "../context/DocumentsContext";
import { useSettings } from "../context/SettingsContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import {
    convertToCurrency,
    formatAmount,
    getTotalAmountPrimary,
    getTotalPages,
} from "../utils/calculations";

interface SummarySectionProps {
  onOpenCurrencySettings: () => void;
  onOpenDeductions: () => void;
  onExportPdf?: () => void;
}

export function SummarySection({
  onOpenCurrencySettings,
  onOpenDeductions,
  onExportPdf,
}: SummarySectionProps) {
  const { documents } = useDocuments();
  const { additionalCurrencies } = useCurrencies();
  const { deductions } = useDeductions();
  const { primaryCurrencyName } = useSettings();

  const totalPages = getTotalPages(documents);
  const totalAmountPrimary = getTotalAmountPrimary(documents);
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netAmount = Math.max(0, totalAmountPrimary - totalDeductions);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>إجمالي الصفحات</Text>
        <Text style={styles.value}>{totalPages}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>الإجمالي ({primaryCurrencyName})</Text>
        <Text style={styles.valueAmount}>
          {formatAmount(totalAmountPrimary)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>الخصومات</Text>
        <TouchableOpacity onPress={onOpenDeductions}>
          <Text style={styles.deductionsLink}>
            {formatAmount(totalDeductions)} — إدارة
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>الصافي ({primaryCurrencyName})</Text>
        <Text style={styles.netAmount}>{formatAmount(netAmount)}</Text>
      </View>
      {additionalCurrencies.length > 0 && (
        <View style={styles.currencies}>
          {additionalCurrencies.map((c) => (
            <View key={c.id} style={styles.currencyRow}>
              <Text style={styles.currencyLabel}>{c.name}</Text>
              <Text style={styles.currencyValue}>
                {formatAmount(convertToCurrency(netAmount, c))}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={onOpenCurrencySettings}
        >
          <Text style={styles.currencyButtonText}>إعداد العملات</Text>
        </TouchableOpacity>
        {onExportPdf && (
          <TouchableOpacity style={styles.footerBtn} onPress={onExportPdf}>
            <Text style={styles.currencyButtonText}>تصدير PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: { fontSize: 16, color: colors.textSecondary },
  value: { fontSize: 18, fontWeight: "600", color: colors.text },
  valueAmount: { fontSize: 18, fontWeight: "700", color: colors.primary },
  deductionsLink: { fontSize: 16, color: colors.primary },
  netAmount: { fontSize: 18, fontWeight: "700", color: colors.success },
  currencies: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  currencyLabel: { fontSize: 14, color: colors.textSecondary },
  currencyValue: { fontSize: 14, color: colors.text },
  footerButtons: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.md,
    flexWrap: "wrap",
  },
  footerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  currencyButtonText: { fontSize: 14, color: colors.primary },
});
