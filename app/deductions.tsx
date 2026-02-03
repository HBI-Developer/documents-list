import { useDeductions } from "@/src/context/DeductionsContext";
import { useSettings } from "@/src/context/SettingsContext";
import { DeductionItem } from "@/src/storage/store";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
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

export default function DeductionsScreen() {
  const insets = useSafeAreaInsets();
  const { primaryCurrencyName } = useSettings();
  const { deductions, addDeduction, updateDeduction, deleteDeduction } =
    useDeductions();

  const [newAmount, setNewAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const handleAdd = useCallback(async () => {
    const amount = parseFloat(newAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("خطأ", "يرجى إدخال مبلغ صحيح");
      return;
    }
    await addDeduction(amount);
    setNewAmount("");
  }, [newAmount, addDeduction]);

  const startEdit = useCallback((d: DeductionItem) => {
    setEditingId(d.id);
    setEditAmount(String(d.amount));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditAmount("");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    const amount = parseFloat(editAmount);
    if (!Number.isFinite(amount) || amount < 0) return;
    await updateDeduction(editingId, amount);
    cancelEdit();
  }, [editingId, editAmount, updateDeduction, cancelEdit]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("حذف الخصم", "هل أنت متأكد من حذف هذا الخصم؟", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => deleteDeduction(id),
        },
      ]);
    },
    [deleteDeduction]
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
        <Text style={styles.hint}>
          تُخصم مبالغ الخصومات من الإجمالي في قسم الملخص. المبلغ بالعملة الأساسية ({primaryCurrencyName}).
        </Text>

        {deductions.map((d) => (
          <View key={d.id} style={styles.row}>
            {editingId === d.id ? (
              <>
                <TextInput
                  style={styles.inputInline}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="decimal-pad"
                  placeholder="المبلغ"
                  placeholderTextColor={colors.placeholder}
                  autoFocus
                />
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.smallBtn} onPress={handleSaveEdit}>
                    <Text style={styles.smallBtnText}>حفظ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={cancelEdit}>
                    <Text style={styles.smallBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.amountText}>{d.amount} {primaryCurrencyName}</Text>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => startEdit(d)}>
                    <Text style={styles.smallBtnText}>تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(d.id)}>
                    <Text style={styles.deleteBtnText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}

        <View style={styles.addSection}>
          <Text style={styles.label}>إضافة خصم جديد</Text>
          <TextInput
            style={styles.input}
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="decimal-pad"
            placeholder={`المبلغ بـ ${primaryCurrencyName}`}
            placeholderTextColor={colors.placeholder}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>+ إضافة خصم</Text>
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
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
    textAlign: "right",
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
  inputInline: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountText: { flex: 1, fontSize: 18, color: colors.text, fontWeight: "600" },
  rowActions: { flexDirection: "row", gap: spacing.sm },
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
  addSection: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
  },
  addBtn: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: { fontSize: 16, color: "#fff", fontWeight: "600" },
});
