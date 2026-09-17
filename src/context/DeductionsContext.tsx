import { nanoid } from "nanoid";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { DeductionItem } from "../storage/store";
import * as store from "../storage/store";
import { clampDeductionPool } from "../utils/calculations";

const DeductionsContext = createContext<{
  deductions: DeductionItem[];
  addDeduction: (amount: number) => Promise<void>;
  updateDeduction: (id: string, amount: number) => Promise<void>;
  deleteDeduction: (id: string) => Promise<void>;
  clampPoolToCapacity: (capacity: number) => Promise<void>;
  load: () => Promise<void>;
} | null>(null);

function parseDeduction(raw: unknown): DeductionItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.amount !== "number") return null;
  return { id: o.id, amount: o.amount };
}

export function DeductionsProvider({ children }: { readonly children: React.ReactNode }) {
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);

  const load = useCallback(async () => {
    const raw = await store.getDeductions();
    const list = raw.map(parseDeduction).filter((d): d is DeductionItem => d !== null);
    setDeductions(list);
  }, []);

  const persist = useCallback(async (list: DeductionItem[]) => {
    setDeductions(list);
    await store.setDeductions(list);
  }, []);

  const addDeduction = useCallback(
    async (amount: number) => {
      const list = [...deductions, { id: nanoid(), amount: Number(amount) || 0 }];
      await persist(list);
    },
    [deductions, persist],
  );

  const updateDeduction = useCallback(
    async (id: string, amount: number) => {
      const list = deductions.map((d) => (d.id === id ? { ...d, amount: Number(amount) || 0 } : d));
      await persist(list);
    },
    [deductions, persist],
  );

  const deleteDeduction = useCallback(
    async (id: string) => {
      await persist(deductions.filter((d) => d.id !== id));
    },
    [deductions, persist],
  );

  /**
   * Enforces pool ≤ capacity, newest-first (LIFO): shrink the most recent
   * deduction; one reduced below 1 is removed and clamping continues.
   */
  const clampPoolToCapacity = useCallback(
    async (capacity: number) => {
      const pool = deductions.reduce((s, d) => s + (d.amount || 0), 0);
      if (pool <= Math.max(0, capacity)) return;
      await persist(clampDeductionPool(deductions, capacity));
    },
    [deductions, persist],
  );

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      deductions,
      addDeduction,
      updateDeduction,
      deleteDeduction,
      clampPoolToCapacity,
      load,
    }),
    [deductions, addDeduction, updateDeduction, deleteDeduction, clampPoolToCapacity, load],
  );

  return <DeductionsContext.Provider value={value}>{children}</DeductionsContext.Provider>;
}

export function useDeductions() {
  const ctx = useContext(DeductionsContext);
  if (!ctx) throw new Error("useDeductions must be used within DeductionsProvider");
  return ctx;
}
