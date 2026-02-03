import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SummarySection } from "../components/SummarySection";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SummarySection
        onOpenCurrencySettings={() => router.push("/currency-settings")}
        onOpenDeductions={() => router.push("/deductions")}
        onExportPdf={() => router.push("/export-pdf")}
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => router.push("/document-details")}
        >
          <Ionicons name="list" size={24} color="#fff" />
          <Text style={styles.detailsBtnText}>تفاصيل المستندات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/document-editor")}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnText}>إضافة مستند جديد</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  actionsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailsBtn: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  addBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
