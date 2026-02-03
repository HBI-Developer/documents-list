import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  documents: "documents",
  currencies: "currencies",
  settings: "settings",
  deductions: "deductions",
} as const;

export async function getDocuments(): Promise<unknown[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.documents);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setDocuments(data: unknown[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.documents, JSON.stringify(data));
}

export async function getCurrencies(): Promise<unknown[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.currencies);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCurrencies(data: unknown[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.currencies, JSON.stringify(data));
}

export type SettingsData = {
  primaryCurrencyName?: string;
  lastCalculationMethod?: "multiply" | "fixed";
};

export async function getSettings(): Promise<SettingsData> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function setSettings(data: SettingsData): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(data));
}

export type DeductionItem = { id: string; amount: number };

export async function getDeductions(): Promise<DeductionItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.deductions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setDeductions(data: DeductionItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.deductions, JSON.stringify(data));
}
