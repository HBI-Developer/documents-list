import { Directory, File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrencies } from "@/src/context/CurrenciesContext";
import { useDeductions } from "@/src/context/DeductionsContext";
import { useDocuments } from "@/src/context/DocumentsContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { applyBackup, buildBackup, validateBackup } from "@/src/utils/databaseBackup";

export default function DatabaseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { load: loadDocuments } = useDocuments();
  const { load: loadCurrencies } = useCurrencies();
  const { load: loadDeductions } = useDeductions();
  const { load: loadSettings } = useSettings();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const backup = await buildBackup();
      const json = JSON.stringify(backup, null, 2);

      const now = new Date();
      const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}`;
      const fileName = `نسخة_قاعدة_البيانات_${dateStr}.json`;

      const tmp = new File(Paths.cache, fileName);
      tmp.create({ overwrite: true });
      tmp.write(json);

      if (Platform.OS === "android") {
        let directory: Directory;
        try {
          directory = await Directory.pickDirectoryAsync();
        } catch {
          // User cancelled the folder picker — stay on screen, no error.
          return;
        }
        const destination = directory.createFile(fileName, "application/json");
        destination.write(await tmp.bytes());
        Alert.alert("تم الحفظ", "تم حفظ النسخة الاحتياطية بنجاح في المجلد المحدد.");
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(tmp.uri, {
            mimeType: "application/json",
            dialogTitle: "حفظ أو مشاركة النسخة الاحتياطية",
          });
        } else {
          Alert.alert("تم", "تم إنشاء ملف النسخة الاحتياطية بنجاح.");
        }
      }
      router.back();
    } catch (e) {
      Alert.alert("خطأ", `فشل التصدير. ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setExporting(false);
    }
  }, [router]);

  const doImport = useCallback(
    async (file: File) => {
      let text: string;
      try {
        text = await file.text();
      } catch {
        Alert.alert("ملف غير صالح", "تعذر قراءة الملف المحدد.");
        return;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        Alert.alert("ملف غير صالح", "الملف المحدد ليس ملف JSON صالحاً.");
        return;
      }
      const result = validateBackup(parsed);
      if (!result.ok) {
        Alert.alert("ملف غير صالح", result.error);
        return;
      }
      const data = result.data;
      Alert.alert(
        "تأكيد الاستيراد",
        `سيتم استبدال جميع البيانات الحالية (${data.documents.length} مستند، ${data.deductions.length} خصومات) بالنسخة الاحتياطية. هل تريد المتابعة؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "استبدال",
            style: "destructive",
            onPress: async () => {
              try {
                await applyBackup(data);
                await Promise.all([
                  loadDocuments(),
                  loadCurrencies(),
                  loadDeductions(),
                  loadSettings(),
                ]);
                Alert.alert("تم", "تم استيراد النسخة الاحتياطية بنجاح.", [
                  { text: "حسناً", onPress: () => router.back() },
                ]);
              } catch (e) {
                Alert.alert("خطأ", `فشل الاستيراد. ${e instanceof Error ? e.message : String(e)}`);
              }
            },
          },
        ],
      );
    },
    [loadCurrencies, loadDeductions, loadDocuments, loadSettings, router],
  );

  const handleImport = useCallback(async () => {
    setImporting(true);
    try {
      const picked = await File.pickFileAsync({
        mimeTypes: ["application/json"],
      });
      if (picked.canceled) return;
      await doImport(picked.result);
    } catch (e) {
      Alert.alert("خطأ", `فشل الاستيراد. ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setImporting(false);
    }
  }, [doImport]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        <Text style={styles.hint}>
          صدّر قاعدة البيانات كاملة (المستندات، العملات، الإعدادات، الخصومات) كملف JSON، أو استورد
          نسخة احتياطية سابقة. الاستيراد يستبدل جميع البيانات الحالية.
        </Text>

        <TouchableOpacity
          style={[styles.exportBtn, exporting && styles.btnDisabled]}
          onPress={handleExport}
          disabled={exporting || importing}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>تصدير نسخة احتياطية (JSON)</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.importBtn, importing && styles.btnDisabled]}
          onPress={handleImport}
          disabled={exporting || importing}
        >
          {importing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>استيراد نسخة احتياطية (JSON)</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.warning}>
          تنبيه: الاستيراد يحذف البيانات الحالية ويستبدلها بمحتوى الملف. تأكد من صحة الملف قبل
          المتابعة.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, direction: "rtl" },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, direction: "rtl" },
  hint: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: "justify",
    lineHeight: 22,
  },
  exportBtn: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  importBtn: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  warning: {
    marginTop: spacing.xl,
    fontSize: 14,
    color: colors.error,
    textAlign: "justify",
    lineHeight: 20,
  },
});
