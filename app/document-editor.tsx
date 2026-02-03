import { DocumentInput, useDocuments } from "@/src/context/DocumentsContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { formatAmount } from "@/src/utils/calculations";
import { todayISO } from "@/src/utils/date";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DocumentEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { documents, addDocument, updateDocument } = useDocuments();
  const { lastCalculationMethod, setLastCalculationMethod } = useSettings();
  const insets = useSafeAreaInsets();

  const editDocument = id ? documents.find((d) => d.id === id) : null;
  const isEdit = !!editDocument;

  const [order, setOrder] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [numberOfPages, setNumberOfPages] = useState("");
  const [calculationMethod, setCalculationMethod] = useState<
    "multiply" | "fixed"
  >(lastCalculationMethod);
  const [valuePerPage, setValuePerPage] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");

  const nameRef = useRef<TextInput>(null);
  const pagesRef = useRef<TextInput>(null);
  const valueRef = useRef<TextInput>(null);
  const fixedRef = useRef<TextInput>(null);

  const resetForm = useCallback(() => {
    setOrder(String(documents.length + 1));
    setName("");
    setDate(new Date());
    setNumberOfPages("");
    setCalculationMethod(lastCalculationMethod);
    setValuePerPage("");
    setFixedAmount("");
  }, [documents.length, lastCalculationMethod]);

  useEffect(() => {
    if (editDocument) {
      setOrder(String(editDocument.order));
      setName(editDocument.name);
      setDate(new Date(editDocument.date || todayISO()));
      setNumberOfPages(String(editDocument.numberOfPages));
      setCalculationMethod(editDocument.calculationMethod);
      setValuePerPage(String(editDocument.valuePerPage));
      setFixedAmount(String(editDocument.fixedAmount));
    } else {
      setOrder(String(documents.length + 1));
      setCalculationMethod(lastCalculationMethod);
    }
  }, [editDocument, documents.length, lastCalculationMethod]);

  const pagesNum = Number(numberOfPages) || 0;
  const valuePerPageNum = Number(valuePerPage) || 0;
  const fixedAmountNum = Number(fixedAmount) || 0;
  const previewAmount =
    calculationMethod === "multiply"
      ? valuePerPageNum * pagesNum
      : fixedAmountNum;

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  const submit = useCallback(async () => {
    const orderNum = Math.max(1, parseInt(order, 10) || 1);
    const input: DocumentInput = {
      order: orderNum,
      name: name.trim(),
      date: formatDate(date),
      numberOfPages: pagesNum,
      calculationMethod,
      valuePerPage: valuePerPageNum,
      fixedAmount: fixedAmountNum,
    };
    if (isEdit && editDocument) {
      await updateDocument(editDocument.id, input);
    } else {
      await addDocument(input);
      await setLastCalculationMethod(calculationMethod);
    }
    router.back();
  }, [
    order,
    name,
    date,
    pagesNum,
    calculationMethod,
    valuePerPageNum,
    fixedAmountNum,
    isEdit,
    editDocument,
    addDocument,
    updateDocument,
    setLastCalculationMethod,
    router,
  ]);

  const maxPossibleOrder = isEdit ? documents.length : documents.length + 1;

  const handleOrderChange = (val: string) => {
    const num = parseInt(val, 10);
    if (val === "") {
      setOrder("");
      return;
    }
    if (!isNaN(num)) {
      if (num > maxPossibleOrder) {
        setOrder(String(maxPossibleOrder));
      } else {
        setOrder(String(Math.max(1, num)));
      }
    }
  };

  const handleOrderBlur = () => {
    if (order === "") {
      setOrder(String(maxPossibleOrder));
    }
  };

  const submitAndContinue = useCallback(async () => {
    const orderNum = Math.max(1, parseInt(order, 10) || 1);
    const input: DocumentInput = {
      order: orderNum,
      name: name.trim(),
      date: formatDate(date),
      numberOfPages: pagesNum,
      calculationMethod,
      valuePerPage: valuePerPageNum,
      fixedAmount: fixedAmountNum,
    };
    await addDocument(input);
    await setLastCalculationMethod(calculationMethod);
    
    // Reset form but increment order for the next one
    resetForm();
    setOrder(String(documents.length + 2)); 
    setTimeout(() => nameRef.current?.focus(), 100);
  }, [
    order,
    name,
    date,
    pagesNum,
    calculationMethod,
    valuePerPageNum,
    fixedAmountNum,
    addDocument,
    setLastCalculationMethod,
    resetForm,
    documents.length,
  ]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>الترتيب</Text>
          <TextInput
            style={styles.input}
            value={order}
            onChangeText={handleOrderChange}
            onBlur={handleOrderBlur}
            keyboardType="number-pad"
            placeholder={String(maxPossibleOrder)}
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
            onSubmitEditing={() => nameRef.current?.focus()}
          />

          <Text style={styles.label}>الاسم</Text>
          <TextInput
            ref={nameRef}
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="اسم المستند"
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
            onSubmitEditing={() => setShowDatePicker(true)}
          />

          <Text style={styles.label}>التاريخ</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>عدد الصفحات</Text>
          <TextInput
            ref={pagesRef}
            style={styles.input}
            value={numberOfPages}
            onChangeText={setNumberOfPages}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
            onSubmitEditing={() =>
              calculationMethod === "multiply"
                ? valueRef.current?.focus()
                : fixedRef.current?.focus()
            }
          />

          <Text style={styles.label}>طريقة الحساب</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={[
                styles.radioBtn,
                calculationMethod === "multiply" && styles.radioBtnActive,
              ]}
              onPress={() => setCalculationMethod("multiply")}
            >
              <Text
                style={[
                  styles.radioText,
                  calculationMethod === "multiply" && styles.radioTextActive,
                ]}
              >
                قيمة × عدد الصفحات
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioBtn,
                calculationMethod === "fixed" && styles.radioBtnActive,
              ]}
              onPress={() => setCalculationMethod("fixed")}
            >
              <Text
                style={[
                  styles.radioText,
                  calculationMethod === "fixed" && styles.radioTextActive,
                ]}
              >
                مبلغ ثابت
              </Text>
            </TouchableOpacity>
          </View>

          {calculationMethod === "multiply" ? (
            <>
              <Text style={styles.label}>القيمة لكل صفحة</Text>
              <TextInput
                ref={valueRef}
                style={styles.input}
                value={valuePerPage}
                onChangeText={setValuePerPage}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>المبلغ الثابت</Text>
              <TextInput
                ref={fixedRef}
                style={styles.input}
                value={fixedAmount}
                onChangeText={setFixedAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            </>
          )}

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>المبلغ المحسوب:</Text>
            <Text style={styles.previewValue}>{formatAmount(previewAmount)}</Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(spacing.lg, insets.bottom + 12) },
          ]}
        >
          {isEdit ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={submit}>
              <Text style={styles.primaryBtnText}>حفظ التعديلات</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={submit}>
                <Text style={styles.primaryBtnText}>إضافة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.continueBtn]}
                onPress={submitAndContinue}
              >
                <Text style={styles.primaryBtnText}>إضافة ومتابعة</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  dateSelector: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    justifyContent: "center",
  },
  dateText: { fontSize: 16, color: colors.text },
  radioRow: { flexDirection: "row", gap: spacing.sm, marginTop: 8 },
  radioBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  radioBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha,
  },
  radioText: { fontSize: 13, color: colors.text },
  radioTextActive: { color: colors.primary, fontWeight: "600" },
  preview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
  },
  previewLabel: { fontSize: 16, color: colors.textSecondary },
  previewValue: { fontSize: 18, fontWeight: "700", color: colors.primary },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  primaryBtn: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  continueBtn: { backgroundColor: colors.primaryDim },
  primaryBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
