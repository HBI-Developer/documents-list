import { nanoid } from "nanoid";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import * as store from "../storage/store";
import type { CurrencyItem } from "../utils/calculations";

type CurrencyInput = {
  name: string;
  rateToPrimary: number;
  conversionOp: "multiply" | "divide";
};

const CurrenciesContext = createContext<{
  additionalCurrencies: CurrencyItem[];
  addCurrency: (input: CurrencyInput) => Promise<void>;
  updateCurrency: (id: string, input: CurrencyInput) => Promise<void>;
  deleteCurrency: (id: string) => Promise<void>;
  load: () => Promise<void>;
} | null>(null);

export function CurrenciesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [additionalCurrencies, setList] = useState<CurrencyItem[]>([]);

  const load = useCallback(async () => {
    const raw = await store.getCurrencies();
    const list = (raw as any[]).filter(
      (c) => c && typeof c.id === "string" && typeof c.name === "string"
    ).map(c => ({
      ...c,
      rateToPrimary: typeof c.rateToPrimary === "number" ? c.rateToPrimary : 1,
      conversionOp: c.conversionOp || "divide"
    })) as CurrencyItem[];
    setList(list);
  }, []);

  const persist = useCallback(async (list: CurrencyItem[]) => {
    setList(list);
    await store.setCurrencies(list);
  }, []);

  const addCurrency = useCallback(
    async (input: CurrencyInput) => {
      const list = [
        ...additionalCurrencies,
        {
          id: nanoid(),
          name: input.name,
          rateToPrimary: input.rateToPrimary,
          conversionOp: input.conversionOp,
        },
      ];
      await persist(list);
    },
    [additionalCurrencies, persist]
  );

  const updateCurrency = useCallback(
    async (id: string, input: CurrencyInput) => {
      const list = additionalCurrencies.map((c) =>
        c.id === id
          ? {
              ...c,
              name: input.name,
              rateToPrimary: input.rateToPrimary,
              conversionOp: input.conversionOp,
            }
          : c
      );
      await persist(list);
    },
    [additionalCurrencies, persist]
  );

  const deleteCurrency = useCallback(
    async (id: string) => {
      const list = additionalCurrencies.filter((c) => c.id !== id);
      await persist(list);
    },
    [additionalCurrencies, persist]
  );

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      additionalCurrencies,
      addCurrency,
      updateCurrency,
      deleteCurrency,
      load,
    }),
    [additionalCurrencies, addCurrency, updateCurrency, deleteCurrency, load]
  );

  return (
    <CurrenciesContext.Provider value={value}>
      {children}
    </CurrenciesContext.Provider>
  );
}

export function useCurrencies() {
  const ctx = useContext(CurrenciesContext);
  if (!ctx)
    throw new Error("useCurrencies must be used within CurrenciesProvider");
  return ctx;
}
