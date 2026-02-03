import { DocumentGrid } from "@/src/components/DocumentGrid";
import { FAB } from "@/src/components/FAB";
import { useDocuments } from "@/src/context/DocumentsContext";
import { colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { documents } = useDocuments();

  const openAdd = useCallback(() => {
    router.push("/document-editor");
  }, [router]);

  const openEdit = useCallback((doc: any) => {
    router.push({
      pathname: "/document-editor",
      params: { id: doc.id },
    });
  }, [router]);

  return (
    <View style={styles.container}>
      <DocumentGrid onEditDocument={openEdit} />
      <FAB onPress={openAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
