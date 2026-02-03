import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DocumentItem } from "../utils/calculations";
import { formatAmount, getDocumentAmount } from "../utils/calculations";
import { formatDateDisplay } from "../utils/date";

interface DocumentCardProps {
  document: DocumentItem;
  serialNumber: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDisabled: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function DocumentCard({
  document,
  serialNumber,
  onEdit,
  onDelete,
  onToggleDisabled,
  selected,
  onToggleSelect,
}: DocumentCardProps) {
  const amount = getDocumentAmount(document);
  const isDisabled = document.disabled;

  return (
    <View
      style={[
        styles.card,
        isDisabled && styles.cardDisabled,
        selected && styles.cardSelected,
      ]}
    >
      {onToggleSelect && (
        <TouchableOpacity
          style={styles.checkbox}
          onPress={onToggleSelect}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View
            style={[styles.checkboxInner, selected && styles.checkboxSelected]}
          />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <Text style={[styles.serial, isDisabled && styles.textDisabled]}>
          #{serialNumber}
        </Text>
        <Text
          style={[styles.name, isDisabled && styles.nameDisabled]}
          numberOfLines={2}
        >
          {document.name || "—"}
        </Text>
        <Text style={[styles.meta, isDisabled && styles.textDisabled]}>
          {formatDateDisplay(document.date)}
        </Text>
        <Text style={[styles.meta, isDisabled && styles.textDisabled]}>
          {document.numberOfPages} صفحة
        </Text>
        <Text style={[styles.amount, isDisabled && styles.textDisabled]}>
          {formatAmount(amount)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Text style={styles.actionText}>تعديل</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onToggleDisabled}>
          <Text style={styles.actionText}>
            {isDisabled ? "تفعيل" : "تعطيل"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={onDelete}
        >
          <Text style={styles.actionText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const deleteBtnBg = colors.errorAlpha;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
  },
  cardDisabled: {
    backgroundColor: colors.cardDisabled,
    borderColor: colors.cardDisabledBorder,
    opacity: 0.85,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkbox: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 1,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  content: { marginTop: spacing.sm },
  serial: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  meta: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  nameDisabled: { textDecorationLine: "line-through", color: colors.disabled },
  textDisabled: { color: colors.textMuted },
  actions: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 6,
  },
  deleteBtn: { backgroundColor: deleteBtnBg },
  actionText: { fontSize: 12, color: colors.text },
});
