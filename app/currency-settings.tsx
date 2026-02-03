import { useCurrencies } from "@/src/context/CurrenciesContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import type { CurrencyItem } from "@/src/utils/calculations";
import { useCallback, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CurrencySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { primaryCurrencyName, setPrimaryCurrencyName } = useSettings();
  const { additionalCurrencies, addCurrency, updateCurrency, deleteCurrency } =
    useCurrencies();

  const [primaryName, setPrimaryName] = useState(primaryCurrencyName);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newOp, setNewOp] = useState<"multiply" | "divide">("divide");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editOp, setEditOp] = useState<"multiply" | "divide">("divide");

  const handleSavePrimary = useCallback(async () => {
    await setPrimaryCurrencyName(primaryName.trim() || "د.ع");
    Alert.alert("نجاح", "تم حفظ العملة الأساسية");
  }, [primaryName, setPrimaryCurrencyName]);

  const handleAddCurrency = useCallback(async () => {
    const name = newName.trim();
    const rate = parseFloat(newRate);
    if (!name) return;
    if (!Number.isFinite(rate) || rate <= 0) {
      Alert.alert("خطأ", "أدخل نسبة تحويل صحيحة (عدد موجب)");
      return;
    }
    await addCurrency({ name, rateToPrimary: rate, conversionOp: newOp });
    setNewName("");
    setNewRate("");
    setNewOp("divide");
  }, [newName, newRate, newOp, addCurrency]);

  const startEdit = useCallback((c: CurrencyItem) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditRate(String(c.rateToPrimary));
    setEditOp(c.conversionOp || "divide");
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
    setEditRate("");
    setEditOp("divide");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    const name = editName.trim();
    const rate = parseFloat(editRate);
    if (!name || !Number.isFinite(rate) || rate <= 0) {
      Alert.alert("خطأ", "الاسم ونسبة التحويل مطلوبان (عدد موجب)");
      return;
    }
    await updateCurrency(editingId, {
      name,
      rateToPrimary: rate,
      conversionOp: editOp,
    });
    cancelEdit();
  }, [editingId, editName, editRate, editOp, updateCurrency, cancelEdit]);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert("حذف عملة", `هل أنت متأكد من حذف العملة "${name}"؟`, [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => deleteCurrency(id),
        },
      ]);
    },
    [deleteCurrency]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={styles.sectionTitle}>العملة الأساسية</Text>
        <Text style={styles.label}>اسم العملة</Text>
        <TextInput
          style={styles.input}
          value={primaryName}
          onChangeText={setPrimaryName}
          placeholder="مثال: د.ع"
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSavePrimary}>
          <Text style={styles.saveBtnText}>حفظ العملة الأساسية</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle2}>عملات إضافية</Text>
        {additionalCurrencies.map((c) => (
          <View key={c.id} style={styles.currencyRow}>
            {editingId === c.id ? (
              <View style={styles.editContainer}>
                <View style={styles.editFields}>
                  <TextInput
                    style={styles.inputSmall}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="الاسم"
                    placeholderTextColor={colors.placeholder}
                  />
                  <TextInput
                    style={styles.inputSmall}
                    value={editRate}
                    onChangeText={setEditRate}
                    keyboardType="decimal-pad"
                    placeholder="النسبة"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={styles.opRow}>
                  <TouchableOpacity
                    style={[
                      styles.opBtn,
                      editOp === "multiply" && styles.opBtnActive,
                    ]}
                    onPress={() => setEditOp("multiply")}
                  >
                    <Text
                      style={[
                        styles.opText,
                        editOp === "multiply" && styles.opTextActive,
                      ]}
                    >
                      أقل قيمة (ضرب)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.opBtn,
                      editOp === "divide" && styles.opBtnActive,
                    ]}
                    onPress={() => setEditOp("divide")}
                  >
                    <Text
                      style={[
                        styles.opText,
                        editOp === "divide" && styles.opTextActive,
                      ]}
                    >
                      أعلى قيمة (قسمة)
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.smallBtnText}>حفظ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={cancelEdit}
                  >
                    <Text style={styles.smallBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyName}>{c.name}</Text>
                  <Text style={styles.currencyRate}>
                    {c.conversionOp === "multiply" ? "القيمة الأساسية ×" : "القيمة الأساسية ÷"}{" "}
                    {c.rateToPrimary}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => startEdit(c)}
                  >
                    <Text style={styles.smallBtnText}>تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(c.id, c.name)}
                  >
                    <Text style={styles.deleteBtnText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}

        <View style={styles.addSection}>
          <Text style={styles.label}>إضافة عملة جديدة</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="اسم العملة (مثال: USD)"
            placeholderTextColor={colors.placeholder}
          />
          <TextInput
            style={styles.input}
            value={newRate}
            onChangeText={setNewRate}
            keyboardType="decimal-pad"
            placeholder="نسبة التحويل"
            placeholderTextColor={colors.placeholder}
          />
          <View style={styles.opRow}>
            <TouchableOpacity
              style={[styles.opBtn, newOp === "multiply" && styles.opBtnActive]}
              onPress={() => setNewOp("multiply")}
            >
              <Text
                style={[
                  styles.opText,
                  newOp === "multiply" && styles.opTextActive,
                ]}
              >
                أقل قيمة (ضرب)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.opBtn, newOp === "divide" && styles.opBtnActive]}
              onPress={() => setNewOp("divide")}
            >
              <Text
                style={[styles.opText, newOp === "divide" && styles.opTextActive]}
              >
                أعلى قيمة (قسمة)
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddCurrency}>
            <Text style={styles.addBtnText}>+ إضافة عملة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitle2: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputSmall: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.text,
    minWidth: 70,
  },
  saveBtn: {
    padding: spacing.md,
    backgroundColor: colors.primaryAlpha,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  saveBtnText: { fontSize: 16, color: colors.primary, fontWeight: "600" },
  addBtn: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  currencyRow: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editForm: { flex: 1, flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  currencyInfo: { flex: 1 },
  currencyName: { fontSize: 17, fontWeight: "600", color: colors.text },
  currencyRate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: "row", gap: spacing.sm },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
  },
  smallBtnText: { fontSize: 14, color: colors.text },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.errorAlpha,
    borderRadius: 8,
  },
  deleteBtnText: { fontSize: 14, color: colors.error },
  editContainer: { flex: 1, gap: spacing.sm },
  editFields: { flexDirection: "row", gap: spacing.sm },
  opRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  opBtn: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  opBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha,
  },
  opText: { fontSize: 12, color: colors.textSecondary },
  opTextActive: { color: colors.primary, fontWeight: "600" },
  addSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
  },
});
