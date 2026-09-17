import Ionicons from "@react-native-vector-icons/ionicons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDeductions } from "../context/DeductionsContext";
import { useDocuments } from "../context/DocumentsContext";
import {
  type DocumentViewMode,
  getViewMode,
  setViewMode as persistViewMode,
} from "../storage/store";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DocumentItem } from "../utils/calculations";
import {
  allocateDeductionBlocks,
  getAutoBlocked,
  getDisabledAmount,
  getDocumentAmount,
} from "../utils/calculations";
import { DisableAmountDialog } from "./DisableAmountDialog";
import { DocumentCard } from "./DocumentCard";
import { DocumentListItem } from "./DocumentListItem";

interface DocumentGridProps {
  readonly onEditDocument: (doc: DocumentItem) => void;
  readonly ListHeaderComponent?: React.ReactElement | null;
}

export function DocumentGrid({ onEditDocument, ListHeaderComponent }: DocumentGridProps) {
  const { documents, deleteDocument, deleteDocuments, clearAll, setDisabledAmount, clearDisabled } =
    useDocuments();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [viewMode, setViewMode] = useState<DocumentViewMode>("grid");
  const [pendingDoc, setPendingDoc] = useState<DocumentItem | null>(null);
  const { deductions } = useDeductions();
  const deductionPool = deductions.reduce((s, d) => s + (d.amount || 0), 0);
  const autoAllocation = useMemo(
    () => allocateDeductionBlocks(documents, deductionPool),
    [documents, deductionPool],
  );

  useEffect(() => {
    getViewMode().then((mode) => {
      if (mode) setViewMode(mode);
    });
  }, []);

  const handleViewModeChange = useCallback((mode: DocumentViewMode) => {
    setViewMode(mode);
    persistViewMode(mode);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const exitMultiSelect = useCallback(() => {
    setMultiSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    Alert.alert("حذف المحدد", `حذف ${ids.length} عنصر؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => deleteDocuments(ids).then(exitMultiSelect),
      },
    ]);
  }, [selectedIds, deleteDocuments, exitMultiSelect]);

  const handleClearAll = useCallback(() => {
    Alert.alert("مسح الكل", "حذف جميع المستندات؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "مسح الكل", style: "destructive", onPress: clearAll },
    ]);
  }, [clearAll]);

  const renderItem = useCallback(
    ({ item, index }: { item: DocumentItem; index: number }) => {
      const cardProps = {
        document: item,
        serialNumber: index + 1,
        allocation: autoAllocation,
        onEdit: () => onEditDocument(item),
        onDelete: () => {
          Alert.alert("حذف", "حذف هذا المستند؟", [
            { text: "إلغاء", style: "cancel" },
            {
              text: "حذف",
              style: "destructive",
              onPress: () => deleteDocument(item.id),
            },
          ]);
        },
        onToggleDisabled: () => setPendingDoc(item),
        selected: multiSelectMode && selectedIds.has(item.id),
        onToggleSelect: multiSelectMode ? () => toggleSelect(item.id) : undefined,
      };
      return viewMode === "list" ? (
        <DocumentListItem {...cardProps} />
      ) : (
        <DocumentCard {...cardProps} />
      );
    },
    [
      onEditDocument,
      deleteDocument,
      autoAllocation,
      multiSelectMode,
      selectedIds,
      toggleSelect,
      viewMode,
    ],
  );

  const keyExtractor = useCallback((item: DocumentItem) => item.id, []);

  const pendingFull = pendingDoc ? getDocumentAmount(pendingDoc) : 0;
  const pendingAuto = pendingDoc ? getAutoBlocked(pendingDoc, autoAllocation) : 0;
  const pendingManual = pendingDoc ? getDisabledAmount(pendingDoc) : 0;
  const pendingManualMax = Math.max(0, pendingFull - pendingAuto);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "grid" && styles.viewToggleBtnActive]}
            onPress={() => handleViewModeChange("grid")}
            accessibilityRole="button"
            accessibilityLabel="عرض شبكي"
            accessibilityState={{ selected: viewMode === "grid" }}
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={viewMode === "grid" ? "#fff" : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "list" && styles.viewToggleBtnActive]}
            onPress={() => handleViewModeChange("list")}
            accessibilityRole="button"
            accessibilityLabel="عرض قائمة"
            accessibilityState={{ selected: viewMode === "list" }}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={viewMode === "list" ? "#fff" : colors.text}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.toolbarIconBtn, multiSelectMode && styles.toolbarBtnActive]}
          onPress={() => setMultiSelectMode((m) => !m)}
          accessibilityRole="button"
          accessibilityLabel={multiSelectMode ? "إلغاء التحديد" : "تحديد متعدد"}
          accessibilityState={{ selected: multiSelectMode }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={multiSelectMode ? "close-circle-outline" : "checkbox-outline"}
            size={20}
            color={multiSelectMode ? "#fff" : colors.text}
          />
        </TouchableOpacity>
        {multiSelectMode && (
          <TouchableOpacity
            style={[styles.toolbarIconBtn, styles.toolbarBtnDangerBg]}
            onPress={handleDeleteSelected}
            accessibilityRole="button"
            accessibilityLabel={`حذف المحدد، ${selectedIds.size} عناصر`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            {selectedIds.size > 0 && (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>{selectedIds.size}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.toolbarIconBtn, styles.toolbarBtnDangerBg]}
          onPress={handleClearAll}
          accessibilityRole="button"
          accessibilityLabel="مسح الكل"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-bin-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <FlatList
        key={viewMode}
        data={documents}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={viewMode === "grid" ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد مستندات. استخدم الزر العائم للإضافة.</Text>
          </View>
        }
      />
      <DisableAmountDialog
        visible={pendingDoc !== null}
        totalAmount={pendingFull}
        maxAmount={pendingManualMax}
        autoBlockedAmount={pendingAuto}
        initialAmount={pendingManual > 0 ? pendingManual : pendingManualMax}
        hasExistingDisabled={pendingManual > 0}
        onConfirm={(amount) => {
          if (pendingDoc) setDisabledAmount(pendingDoc.id, amount);
          setPendingDoc(null);
        }}
        onClear={() => {
          if (pendingDoc) clearDisabled(pendingDoc.id);
          setPendingDoc(null);
        }}
        onCancel={() => setPendingDoc(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBlock: spacing.md,
  },
  toolbarBtnActive: { backgroundColor: colors.primary },
  toolbarIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  toolbarBtnDangerBg: {
    backgroundColor: colors.errorAlpha,
  },
  iconBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  iconBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  viewToggleBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  viewToggleBtnActive: { backgroundColor: colors.primary },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: "flex-start",
  },
  listContent: { paddingBottom: 100 },
  empty: { padding: spacing.xxl, alignItems: "center" },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
