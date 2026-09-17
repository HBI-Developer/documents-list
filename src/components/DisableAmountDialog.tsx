import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { formatAmount } from "../utils/calculations";

interface DisableAmountDialogProps {
  readonly visible: boolean;
  readonly totalAmount: number;
  /** Manual-disable range cap (full total minus deduction auto-block). */
  readonly maxAmount?: number;
  /** Deduction-driven blocked amount, for the remaining hint. */
  readonly autoBlockedAmount?: number;
  readonly initialAmount: number;
  readonly hasExistingDisabled: boolean;
  readonly onConfirm: (amount: number) => void;
  readonly onClear?: () => void;
  readonly onCancel: () => void;
}

function sanitizeNumericInput(val: string): string {
  return val.replace(/[^0-9.]/g, "");
}

export function DisableAmountDialog({
  visible,
  totalAmount,
  maxAmount,
  autoBlockedAmount,
  initialAmount,
  hasExistingDisabled,
  onConfirm,
  onClear,
  onCancel,
}: DisableAmountDialogProps) {
  const full = Number.isFinite(totalAmount) ? totalAmount : 0;
  const auto = Number.isFinite(autoBlockedAmount) ? Math.max(0, autoBlockedAmount as number) : 0;
  const cap = Number.isFinite(maxAmount) ? Math.min(Math.max(0, maxAmount as number), full) : full;
  const [value, setValue] = useState("");

  useEffect(() => {
    if (visible) {
      const fallback = Math.max(0, cap);
      const seed =
        Number.isFinite(initialAmount) && initialAmount > 0
          ? Math.min(initialAmount, cap)
          : fallback;
      setValue(cap > 0 ? String(seed) : "");
    }
  }, [visible, initialAmount, cap]);

  const parsed = value.trim() === "" ? Number.NaN : Number(value);
  const canConfirm =
    cap > 0 && value.trim() !== "" && Number.isFinite(parsed) && parsed >= 1 && parsed <= cap;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(Math.min(Math.max(1, parsed), cap));
  };

  const handleBlur = () => {
    // Empty field reverts to the maximum disableable amount.
    if (value.trim() === "" && cap > 0) setValue(String(cap));
  };

  // Branch the dialog body with statements instead of nested ternaries.
  let amountBody: ReactNode;
  if (full <= 0) {
    amountBody = <Text style={styles.hint}>لا يمكن التعطيل — مبلغ المستند صفر.</Text>;
  } else if (cap <= 0) {
    amountBody = (
      <Text style={styles.hint}>
        هذا المستند مغطى بالكامل بالخصومات — لا يوجد مبلغ متاح للتعطيل اليدوي.
      </Text>
    );
  } else {
    amountBody = (
      <>
        <Text style={styles.label}>المبلغ المراد تعطيله (1 – {formatAmount(cap)})</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(v) => setValue(sanitizeNumericInput(v))}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          placeholder={String(cap)}
          placeholderTextColor={colors.placeholder}
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
          autoFocus
        />
        <Text style={styles.hint}>
          المتبقي:{" "}
          {formatAmount(
            Number.isFinite(parsed) ? Math.max(0, full - auto - parsed) : Math.max(0, full - auto),
          )}
        </Text>
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>تعطيل المبلغ</Text>
          <Text style={styles.subtitle}>إجمالي المستند: {formatAmount(full)}</Text>
          {amountBody}
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
          {hasExistingDisabled && onClear && (
            <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
              <Text style={styles.clearText}>إزالة التعطيل (تفعيل)</Text>
            </TouchableOpacity>
          )}
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
  clearBtn: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  clearText: { fontSize: 14, color: colors.error },
});
