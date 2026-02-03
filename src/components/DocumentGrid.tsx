import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDocuments } from "../context/DocumentsContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DocumentItem } from "../utils/calculations";
import { DocumentCard } from "./DocumentCard";

interface DocumentGridProps {
  onEditDocument: (doc: DocumentItem) => void;
  ListHeaderComponent?: React.ReactElement | null;
}

export function DocumentGrid({
  onEditDocument,
  ListHeaderComponent,
}: DocumentGridProps) {
  const {
    documents,
    deleteDocument,
    deleteDocuments,
    clearAll,
    toggleDisabled,
  } = useDocuments();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);

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
    ({ item, index }: { item: DocumentItem; index: number }) => (
      <DocumentCard
        document={item}
        serialNumber={index + 1}
        onEdit={() => onEditDocument(item)}
        onDelete={() => {
          Alert.alert("حذف", "حذف هذا المستند؟", [
            { text: "إلغاء", style: "cancel" },
            {
              text: "حذف",
              style: "destructive",
              onPress: () => deleteDocument(item.id),
            },
          ]);
        }}
        onToggleDisabled={() => toggleDisabled(item.id)}
        selected={multiSelectMode && selectedIds.has(item.id)}
        onToggleSelect={
          multiSelectMode ? () => toggleSelect(item.id) : undefined
        }
      />
    ),
    [
      onEditDocument,
      deleteDocument,
      toggleDisabled,
      multiSelectMode,
      selectedIds,
      toggleSelect,
    ]
  );

  const keyExtractor = useCallback((item: DocumentItem) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.toolbarBtn,
            multiSelectMode && styles.toolbarBtnActive,
          ]}
          onPress={() => setMultiSelectMode((m) => !m)}
        >
          <Text style={styles.toolbarBtnText}>
            {multiSelectMode ? "إلغاء التحديد" : "تحديد متعدد"}
          </Text>
        </TouchableOpacity>
        {multiSelectMode && (
          <TouchableOpacity
            style={styles.toolbarBtnDanger}
            onPress={handleDeleteSelected}
          >
            <Text style={styles.toolbarBtnText}>
              حذف المحدد ({selectedIds.size})
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.toolbarBtnDanger}
          onPress={handleClearAll}
        >
          <Text style={styles.toolbarBtnText}>مسح الكل</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              لا توجد مستندات. استخدم الزر العائم للإضافة.
            </Text>
          </View>
        }
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
    marginBottom: spacing.sm,
  },
  toolbarBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
  },
  toolbarBtnActive: { backgroundColor: colors.primary },
  toolbarBtnDanger: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.errorAlpha,
    borderRadius: 8,
  },
  toolbarBtnText: { fontSize: 14, color: colors.text },
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
