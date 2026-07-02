import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const [showTooltip, setShowTooltip] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen to the right
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleExportPress = () => {
    if (documents.length === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowTooltip(true);

      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      timeoutRef.current = setTimeout(() => {
        // Slide out
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowTooltip(false));
      }, 5000);
    } else {
      if (onExportPdf) onExportPdf();
    }
  };

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
          <TouchableOpacity
            style={styles.footerBtn}
            onPress={handleExportPress}
          >
            <Text style={styles.currencyButtonText}>تصدير PDF</Text>
          </TouchableOpacity>
        )}
      </View>

      {showTooltip && (
        <Animated.View
          style={[
            styles.tooltipContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={styles.tooltipText}>
            يجب إضافة مستند واحد على الأقل للتصدير
          </Text>
        </Animated.View>
      )}
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
  tooltipContainer: {
    position: "absolute",
    top: -10,
    left: -11, // Positions it 5px from the screen edge (compensating for parent 16px margin)
    width: 220,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
