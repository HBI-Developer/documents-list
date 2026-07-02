import { useDocuments } from "@/src/context/DocumentsContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { formatAmount, getDocumentAmount } from "@/src/utils/calculations";
import { formatDateDisplay } from "@/src/utils/date";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ExportColumnKey = "serial" | "date" | "pages" | "amount";

const COLUMN_LABELS: Record<ExportColumnKey, string> = {
  serial: "الرقم التسلسلي",
  date: "التاريخ",
  pages: "عدد الصفحات",
  amount: "المبلغ",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function ExportPdfScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { documents } = useDocuments();
  const { primaryCurrencyName } = useSettings();
  
  const [includeSerial, setIncludeSerial] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [includePages, setIncludePages] = useState(true);
  const [includeAmount, setIncludeAmount] = useState(true);
  const [loading, setLoading] = useState(false);

  const buildHtml = useCallback(() => {
    const sorted = [...documents].sort((a, b) => a.order - b.order);
    const cols: { key: ExportColumnKey | "name"; label: string }[] = [
      { key: "name", label: "الاسم" },
    ];
    if (includeSerial) cols.unshift({ key: "serial", label: "م" });
    if (includeDate) cols.push({ key: "date", label: "التاريخ" });
    if (includePages) cols.push({ key: "pages", label: "عدد الصفحات" });
    if (includeAmount)
      cols.push({ key: "amount", label: `المبلغ (${primaryCurrencyName})` });

    const headerCells = cols
      .map((c) => `<th>${escapeHtml(c.label)}</th>`)
      .join("");
    const rows = sorted.map((doc, i) => {
      const cells = cols.map((c) => {
        if (c.key === "serial") return `<td>${i + 1}</td>`;
        if (c.key === "name") return `<td>${escapeHtml(doc.name || "—")}</td>`;
        if (c.key === "date")
          return `<td>${escapeHtml(formatDateDisplay(doc.date))}</td>`;
        if (c.key === "pages") return `<td>${doc.numberOfPages}</td>`;
        if (c.key === "amount")
          return `<td>${formatAmount(getDocumentAmount(doc))}</td>`;
        return "<td></td>";
      });
      return `<tr>${cells.join("")}</tr>`;
    });

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, 'Segoe UI', sans-serif; padding: 24px; color: #1e293b; }
    h1 { font-size: 20px; margin-bottom: 16px; text-align: center; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: right; }
    th { background: #6366f1; color: #fff; font-weight: 600; }
    tr:nth-child(even) { background: #f1f5f9; }
    tr:nth-child(odd) { background: #fff; }
  </style>
</head>
<body>
  <h1>قائمة المستندات</h1>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>
</body>
</html>`;
  }, [
    documents,
    primaryCurrencyName,
    includeSerial,
    includeDate,
    includePages,
    includeAmount,
  ]);

  const handleExport = useCallback(async () => {
    if (documents.length === 0) {
      Alert.alert("تنبيه", "لا توجد مستندات للتصدير.");
      return;
    }
    setLoading(true);
    try {
      const html = buildHtml();
      const { uri } = await Print.printToFileAsync({
        html,
      });

      if (Platform.OS === "android") {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          return;
        }

        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
        const fileName = `قائمة_المستندات_${dateStr}`;

        const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "application/pdf"
        );

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          safUri,
          base64Data,
          { encoding: FileSystem.EncodingType.Base64 }
        );

        Alert.alert("تم الحفظ", "تم حفظ ملف PDF بنجاح في المجلد المحدد.");
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "حفظ أو مشاركة PDF",
          });
        } else {
          Alert.alert("تم", "تم إنشاء الملف بنجاح.");
        }
      }
      router.back();
    } catch (e) {
      Alert.alert(
        "خطأ",
        "فشل إنشاء PDF. " + (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setLoading(false);
    }
  }, [documents.length, buildHtml, router]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={styles.hint}>
          اختر الأعمدة التي تريد إدراجها في ملف PDF. الاسم إلزامي دائماً.
        </Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>{COLUMN_LABELS.serial}</Text>
          <Switch
            value={includeSerial}
            onValueChange={setIncludeSerial}
            trackColor={{ false: colors.border, true: colors.primaryAlpha }}
            thumbColor={includeSerial ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>{COLUMN_LABELS.date}</Text>
          <Switch
            value={includeDate}
            onValueChange={setIncludeDate}
            trackColor={{ false: colors.border, true: colors.primaryAlpha }}
            thumbColor={includeDate ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>{COLUMN_LABELS.pages}</Text>
          <Switch
            value={includePages}
            onValueChange={setIncludePages}
            trackColor={{ false: colors.border, true: colors.primaryAlpha }}
            thumbColor={includePages ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>{COLUMN_LABELS.amount}</Text>
          <Switch
            value={includeAmount}
            onValueChange={setIncludeAmount}
            trackColor={{ false: colors.border, true: colors.primaryAlpha }}
            thumbColor={includeAmount ? colors.primary : colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, loading && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exportBtnText}>بدأ التصدير وحفظ PDF</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  hint: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: "right",
    lineHeight: 22,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionLabel: { fontSize: 16, color: colors.text, fontWeight: "500" },
  exportBtn: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  exportBtnDisabled: { opacity: 0.7 },
  exportBtnText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
