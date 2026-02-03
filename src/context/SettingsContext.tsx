import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as store from "../storage/store";

const defaultPrimary = "د.ع";
const defaultLastCalc = "multiply" as const;

const SettingsContext = createContext<{
  primaryCurrencyName: string;
  setPrimaryCurrencyName: (name: string) => Promise<void>;
  lastCalculationMethod: "multiply" | "fixed";
  setLastCalculationMethod: (method: "multiply" | "fixed") => Promise<void>;
  load: () => Promise<void>;
} | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [primaryCurrencyName, setPrimary] = useState<string>(defaultPrimary);
  const [lastCalculationMethod, setLastCalc] = useState<"multiply" | "fixed">(
    defaultLastCalc
  );

  const load = useCallback(async () => {
    const s = await store.getSettings();
    setPrimary(s.primaryCurrencyName ?? defaultPrimary);
    setLastCalc(s.lastCalculationMethod === "fixed" ? "fixed" : "multiply");
  }, []);

  const setPrimaryCurrencyName = useCallback(
    async (name: string) => {
      setPrimary(name);
      await store.setSettings({
        primaryCurrencyName: name,
        lastCalculationMethod:
          lastCalculationMethod === "fixed" ? "fixed" : "multiply",
      });
    },
    [lastCalculationMethod]
  );

  const setLastCalculationMethod = useCallback(
    async (method: "multiply" | "fixed") => {
      setLastCalc(method);
      await store.setSettings({
        primaryCurrencyName,
        lastCalculationMethod: method,
      });
    },
    [primaryCurrencyName]
  );

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      primaryCurrencyName,
      setPrimaryCurrencyName,
      lastCalculationMethod,
      setLastCalculationMethod,
      load,
    }),
    [
      primaryCurrencyName,
      setPrimaryCurrencyName,
      lastCalculationMethod,
      setLastCalculationMethod,
      load,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
