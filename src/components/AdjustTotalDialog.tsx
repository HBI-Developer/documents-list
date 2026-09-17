import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { formatAmount } from "../utils/calculations";

interface AdjustTotalDialogProps {
  readonly visible: boolean;
  readonly grossTotal: number;
  /** Server-side failure message (e.g. undistributable delta); shown in-dialog. */
  readonly applyError?: string | null;
  readonly onConfirm: (newTotal: number) => void;
  readonly onCancel: () => void;
}

function sanitizeIntegerInput(val: string): string {
  return val.replace(/\D/g, "");
}

function getDeltaHint(delta: number): string {
  if (!Number.isFinite(delta) || delta === 0) {
    return "أدخل إجماليًا جديدًا مختلفًا عن الحالي.";
  }
  if (delta > 0) {
    return `الفرق: +${formatAmount(delta, 0)} — يوزع +1 بالتناوب من آخر مستند إلى الأول.`;
  }
  return `الفرق: ${formatAmount(delta, 0)} — يخصم 1 بالتناوب من آخر مستند إلى الأول، والحد الأدنى صفر لكل مستند.`;
}

export function AdjustTotalDialog({
  visible,
  grossTotal,
  applyError,
  onConfirm,
  onCancel,
}: AdjustTotalDialogProps) {
  const current = Number.isFinite(grossTotal) ? Math.round(grossTotal) : 0;
  const [value, setValue] = useState("");

  useEffect(() => {
    if (visible) setValue(String(current));
  }, [visible, current]);

  const parsed = value.trim() === "" ? Number.NaN : Number(value);
  const delta = Number.isFinite(parsed) ? Math.round(parsed) - current : Number.NaN;
  const canConfirm =
    value.trim() !== "" &&
    Number.isFinite(parsed) &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    delta !== 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(Math.max(0, Math.round(parsed)));
  };

  const deltaHint = getDeltaHint(delta);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>تعديل الإجمالي</Text>
          <Text style={styles.subtitle}>الإجمالي الحالي: {formatAmount(current, 0)}</Text>
          <Text style={styles.label}>الإجمالي الجديد (عدد صحيح ≥ 0)</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(v) => setValue(sanitizeIntegerInput(v))}
            keyboardType="number-pad"
            placeholder={String(current)}
            placeholderTextColor={colors.placeholder}
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
            autoFocus
          />
          <Text style={styles.hint}>{deltaHint}</Text>
          {Number.isFinite(parsed) && parsed === 0 && current > 0 && delta !== 0 && (
            <Text style={styles.hint}>سيتم تصفير جميع المستندات.</Text>
          )}
          {applyError && <Text style={styles.error}>{applyError}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn, !canConfirm && styles.btnDisabled]}
              onPress={handleConfirm}
              disabled={!canConfirm}
            >
              <Text style={styles.confirmText}>تأكيد</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: 4,
    textAlign: "right",
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    textAlign: "right",
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "right",
  },
  error: {
    fontSize: 13,
    color: colors.error,
    marginTop: spacing.sm,
    textAlign: "right",
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtn: { backgroundColor: colors.primary },
  cancelBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnDisabled: { opacity: 0.5 },
  confirmText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  cancelText: { fontSize: 15, fontWeight: "600", color: colors.text },
});
