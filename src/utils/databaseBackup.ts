import type { DeductionItem, DocumentViewMode, SettingsData } from "../storage/store";
import * as store from "../storage/store";

export const DB_BACKUP_VERSION = 1;

export interface BackupDocument {
  id: string;
  order: number;
  name: string;
  date: string;
  numberOfPages: number;
  calculationMethod: "multiply" | "fixed";
  valuePerPage: number;
  fixedAmount: number;
  disabled: boolean;
  disabledAmount: number;
}

export interface BackupCurrency {
  id: string;
  name: string;
  rateToPrimary: number;
  conversionOp: "multiply" | "divide";
}

export interface ValidBackupData {
  documents: BackupDocument[];
  currencies: BackupCurrency[];
  settings: SettingsData;
  deductions: DeductionItem[];
  viewMode: DocumentViewMode | null;
}

export interface DatabaseBackup {
  version: number;
  exportedAt: string;
  data: ValidBackupData;
}

export type BackupValidation = { ok: true; data: ValidBackupData } | { ok: false; error: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function validateDocument(raw: unknown, index: number): BackupDocument | string {
  if (!isRecord(raw)) return `المستند رقم ${index + 1}: بنية غير صالحة`;
  if (typeof raw.id !== "string" || raw.id.length === 0)
    return `المستند رقم ${index + 1}: المعرف (id) مفقود`;
  if (!isFiniteNumber(raw.order)) return `المستند رقم ${index + 1}: الترتيب (order) غير صالح`;
  if (typeof raw.name !== "string") return `المستند رقم ${index + 1}: الاسم غير صالح`;
  if (typeof raw.date !== "string") return `المستند رقم ${index + 1}: التاريخ غير صالح`;
  if (!isFiniteNumber(raw.numberOfPages) || raw.numberOfPages < 0)
    return `المستند رقم ${index + 1}: عدد الصفحات غير صالح`;
  if (raw.calculationMethod !== "multiply" && raw.calculationMethod !== "fixed")
    return `المستند رقم ${index + 1}: طريقة الحساب غير صالحة`;
  if (!isFiniteNumber(raw.valuePerPage) || raw.valuePerPage < 0)
    return `المستند رقم ${index + 1}: القيمة لكل صفحة غير صالحة`;
  if (!isFiniteNumber(raw.fixedAmount) || raw.fixedAmount < 0)
    return `المستند رقم ${index + 1}: المبلغ الثابت غير صالح`;
  const disabled = raw.disabled === undefined ? false : raw.disabled;
  if (typeof disabled !== "boolean") return `المستند رقم ${index + 1}: حقل التعطيل غير صالح`;
  const disabledAmount = raw.disabledAmount === undefined ? 0 : raw.disabledAmount;
  if (!isFiniteNumber(disabledAmount) || disabledAmount < 0)
    return `المستند رقم ${index + 1}: مبلغ التعطيل غير صالح`;
  return {
    id: raw.id,
    order: raw.order,
    name: raw.name,
    date: raw.date,
    numberOfPages: raw.numberOfPages,
    calculationMethod: raw.calculationMethod,
    valuePerPage: raw.valuePerPage,
    fixedAmount: raw.fixedAmount,
    disabled,
    disabledAmount,
  };
}

function validateCurrency(raw: unknown, index: number): BackupCurrency | string {
  if (!isRecord(raw)) return `العملة رقم ${index + 1}: بنية غير صالحة`;
  if (typeof raw.id !== "string" || raw.id.length === 0)
    return `العملة رقم ${index + 1}: المعرف (id) مفقود`;
  if (typeof raw.name !== "string" || raw.name.length === 0)
    return `العملة رقم ${index + 1}: الاسم مفقود`;
  if (!isFiniteNumber(raw.rateToPrimary) || raw.rateToPrimary <= 0)
    return `العملة رقم ${index + 1}: سعر الصرف غير صالح`;
  if (raw.conversionOp !== "multiply" && raw.conversionOp !== "divide")
    return `العملة رقم ${index + 1}: عملية التحويل غير صالحة`;
  return {
    id: raw.id,
    name: raw.name,
    rateToPrimary: raw.rateToPrimary,
    conversionOp: raw.conversionOp,
  };
}

function validateDeduction(raw: unknown, index: number): DeductionItem | string {
  if (!isRecord(raw)) return `الخصم رقم ${index + 1}: بنية غير صالحة`;
  if (typeof raw.id !== "string" || raw.id.length === 0)
    return `الخصم رقم ${index + 1}: المعرف (id) مفقود`;
  if (!isFiniteNumber(raw.amount) || raw.amount < 0)
    return `الخصم رقم ${index + 1}: المبلغ غير صالح`;
  return { id: raw.id, amount: raw.amount };
}

/**
 * Validates a parsed JSON backup. Returns normalized data on success,
 * or an Arabic error message on failure. Never throws.
 */
export function validateBackup(parsed: unknown): BackupValidation {
  if (!isRecord(parsed)) return { ok: false, error: "الملف لا يحتوي على نسخة احتياطية صالحة" };
  if (parsed.version !== DB_BACKUP_VERSION)
    return { ok: false, error: "إصدار النسخة الاحتياطية غير مدعوم" };
  if (!isRecord(parsed.data))
    return { ok: false, error: "الملف لا يحتوي على بيانات قاعدة البيانات" };
  const data = parsed.data;

  const documentsResult = validateDocumentsSection(data.documents);
  if ("error" in documentsResult) return { ok: false, error: documentsResult.error };
  const currenciesResult = validateCurrenciesSection(data.currencies);
  if ("error" in currenciesResult) return { ok: false, error: currenciesResult.error };
  const deductionsResult = validateDeductionsSection(data.deductions);
  if ("error" in deductionsResult) return { ok: false, error: deductionsResult.error };
  const settingsResult = validateSettingsSection(data.settings);
  if ("error" in settingsResult) return { ok: false, error: settingsResult.error };
  const viewModeResult = validateViewModeSection(data.viewMode);
  if ("error" in viewModeResult) return { ok: false, error: viewModeResult.error };

  return {
    ok: true,
    data: {
      documents: documentsResult.documents,
      currencies: currenciesResult.currencies,
      settings: settingsResult.settings,
      deductions: deductionsResult.deductions,
      viewMode: viewModeResult.viewMode,
    },
  };
}

type SectionError = { error: string };

function validateDocumentsSection(raw: unknown): SectionError | { documents: BackupDocument[] } {
  if (!Array.isArray(raw)) return { error: "حقل المستندات (documents) غير صالح" };
  const documents: BackupDocument[] = [];
  const docIds = new Set<string>();
  for (let i = 0; i < raw.length; i++) {
    const result = validateDocument(raw[i], i);
    if (typeof result === "string") return { error: result };
    if (docIds.has(result.id)) return { error: `معرف مستند مكرر: ${result.id}` };
    docIds.add(result.id);
    documents.push(result);
  }
  return { documents };
}

function validateCurrenciesSection(raw: unknown): SectionError | { currencies: BackupCurrency[] } {
  if (!Array.isArray(raw)) return { error: "حقل العملات (currencies) غير صالح" };
  const currencies: BackupCurrency[] = [];
  const currencyIds = new Set<string>();
  for (let i = 0; i < raw.length; i++) {
    const result = validateCurrency(raw[i], i);
    if (typeof result === "string") return { error: result };
    if (currencyIds.has(result.id)) return { error: `معرف عملة مكرر: ${result.id}` };
    currencyIds.add(result.id);
    currencies.push(result);
  }
  return { currencies };
}

function validateDeductionsSection(raw: unknown): SectionError | { deductions: DeductionItem[] } {
  if (!Array.isArray(raw)) return { error: "حقل الخصومات (deductions) غير صالح" };
  const deductions: DeductionItem[] = [];
  const deductionIds = new Set<string>();
  for (let i = 0; i < raw.length; i++) {
    const result = validateDeduction(raw[i], i);
    if (typeof result === "string") return { error: result };
    if (deductionIds.has(result.id)) return { error: `معرف خصم مكرر: ${result.id}` };
    deductionIds.add(result.id);
    deductions.push(result);
  }
  return { deductions };
}

function validateSettingsSection(raw: unknown): SectionError | { settings: SettingsData } {
  if (raw !== undefined && !isRecord(raw)) return { error: "حقل الإعدادات (settings) غير صالح" };
  const settings: SettingsData = {};
  const rawSettings = isRecord(raw) ? raw : {};
  if (rawSettings.primaryCurrencyName !== undefined) {
    if (
      typeof rawSettings.primaryCurrencyName !== "string" ||
      rawSettings.primaryCurrencyName.length === 0
    )
      return { error: "اسم العملة الأساسية غير صالح" };
    settings.primaryCurrencyName = rawSettings.primaryCurrencyName;
  }
  if (rawSettings.lastCalculationMethod !== undefined) {
    if (
      rawSettings.lastCalculationMethod !== "multiply" &&
      rawSettings.lastCalculationMethod !== "fixed"
    )
      return { error: "طريقة الحساب الأخيرة غير صالحة" };
    settings.lastCalculationMethod = rawSettings.lastCalculationMethod;
  }
  return { settings };
}

function validateViewModeSection(
  raw: unknown,
): SectionError | { viewMode: DocumentViewMode | null } {
  if (raw === "grid" || raw === "list") return { viewMode: raw };
  if (raw !== undefined && raw !== null) return { error: "وضع العرض (viewMode) غير صالح" };
  return { viewMode: null };
}

/** Reads the whole database from storage into a versioned backup object. */
export async function buildBackup(): Promise<DatabaseBackup> {
  const [documents, currencies, settings, deductions, viewMode] = await Promise.all([
    store.getDocuments(),
    store.getCurrencies(),
    store.getSettings(),
    store.getDeductions(),
    store.getViewMode(),
  ]);
  return {
    version: DB_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      documents: (Array.isArray(documents) ? documents : []) as BackupDocument[],
      currencies: (Array.isArray(currencies) ? currencies : []) as BackupCurrency[],
      settings: settings ?? {},
      deductions: Array.isArray(deductions) ? deductions : [],
      viewMode: viewMode ?? null,
    },
  };
}

/**
 * Overwrites the whole database with validated backup data.
 * Callers must refresh contexts (load) afterwards.
 */
export async function applyBackup(data: ValidBackupData): Promise<void> {
  await Promise.all([
    store.setDocuments(data.documents),
    store.setCurrencies(data.currencies),
    store.setSettings(data.settings),
    store.setDeductions(data.deductions),
  ]);
  if (data.viewMode === "grid" || data.viewMode === "list") {
    await store.setViewMode(data.viewMode);
  }
}
