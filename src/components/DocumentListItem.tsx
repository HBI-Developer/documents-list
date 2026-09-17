import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DocumentItem } from "../utils/calculations";
import {
  formatAmount,
  getDocumentAmount,
  getNetRemaining,
  isFullyBlocked,
  isPartiallyBlocked,
} from "../utils/calculations";
import { formatDateDisplay } from "../utils/date";
import { getToggleLabel } from "../utils/toggleLabel";

const ICON_SIZE = 14;

interface DocumentListItemProps {
  readonly document: DocumentItem;
  readonly serialNumber: number;
  /** Deduction-driven auto-block allocation (from grid). */
  readonly allocation?: Map<string, number>;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onToggleDisabled: () => void;
  readonly selected?: boolean;
  readonly onToggleSelect?: () => void;
}

export function DocumentListItem({
  document,
  serialNumber,
  allocation = new Map(),
  onEdit,
  onDelete,
  onToggleDisabled,
  selected,
  onToggleSelect,
}: DocumentListItemProps) {
  const amount = getDocumentAmount(document);
  const isFull = isFullyBlocked(document, allocation);
  const isPartial = isPartiallyBlocked(document, allocation);
  const showDisabledStyles = isFull || isPartial;
  const remaining = getNetRemaining(document, allocation);
  const toggleLabel = getToggleLabel(isPartial, showDisabledStyles, remaining);

  return (
    <View
      style={[
        styles.row,
        isFull && styles.rowDisabled,
        isPartial && styles.rowPartial,
        selected && styles.rowSelected,
      ]}
    >
      {onToggleSelect && (
        <TouchableOpacity
          style={styles.checkbox}
          onPress={onToggleSelect}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          accessibilityLabel="تحديد المستند"
        >
          <View style={[styles.checkboxInner, selected && styles.checkboxSelected]} />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.serial, showDisabledStyles && styles.textDisabled]}>
            #{serialNumber}
          </Text>
          <Text style={[styles.name, isFull && styles.nameDisabled]} numberOfLines={1}>
            {document.name || "—"}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, showDisabledStyles && styles.textDisabled]}>
            {formatDateDisplay(document.date)} • {document.numberOfPages} صفحة
          </Text>
          <Text style={[styles.amount, isFull && styles.textDisabled]}>{formatAmount(amount)}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="تعديل"
        >
          <Ionicons name="pencil-outline" size={ICON_SIZE} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onToggleDisabled}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={toggleLabel}
        >
          <Ionicons
            name={showDisabledStyles ? "eye-outline" : "eye-off-outline"}
            size={ICON_SIZE}
            color={colors.text}
          />
          {isPartial && (
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingBadgeText} numberOfLines={1}>
                {formatAmount(remaining, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, styles.deleteBtn]}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="حذف"
        >
          <Ionicons name="trash-outline" size={ICON_SIZE} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowDisabled: {
    backgroundColor: colors.cardDisabled,
    borderColor: colors.cardDisabledBorder,
    opacity: 0.85,
  },
  rowPartial: {
    backgroundColor: colors.cardPartialDisabled,
    borderColor: colors.cardPartialDisabledBorder,
  },
  rowSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkbox: {
    padding: spacing.xs,
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
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  serial: { fontSize: 12, color: colors.textSecondary },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: 2,
  },
  meta: { fontSize: 13, color: colors.textSecondary, flexShrink: 1 },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  nameDisabled: { textDecorationLine: "line-through", color: colors.disabled },
  textDisabled: { color: colors.textMuted },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: { backgroundColor: colors.errorAlpha },
  remainingBadge: {
    position: "absolute",
    top: -9,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexShrink: 0,
  },
  remainingBadgeText: { fontSize: 8, fontWeight: "700", color: "#fff" },
});
