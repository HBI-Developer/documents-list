import { nanoid } from "nanoid";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as store from "../storage/store";
import type { DocumentItem } from "../utils/calculations";
import {
  distributeGrossTotalDelta,
  getDisabledAmount,
  getDocumentAmount,
  getGrossTotal,
} from "../utils/calculations";

export type DocumentInput = {
  order: number;
  name: string;
  date: string;
  numberOfPages: number;
  calculationMethod: "multiply" | "fixed";
  valuePerPage: number;
  fixedAmount: number;
};

const defaultDoc = (): Partial<DocumentItem> => ({
  id: "",
  order: 0,
  name: "",
  date: "",
  numberOfPages: 0,
  calculationMethod: "multiply",
  valuePerPage: 0,
  fixedAmount: 0,
  disabled: false,
  disabledAmount: 0,
});

function parseDocument(raw: unknown): DocumentItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.order !== "number") return null;
  const doc: DocumentItem = {
    id: o.id as string,
    order: o.order as number,
    name: typeof o.name === "string" ? o.name : "",
    date: typeof o.date === "string" ? o.date : "",
    numberOfPages: Number(o.numberOfPages) || 0,
    calculationMethod: o.calculationMethod === "fixed" ? "fixed" : "multiply",
    valuePerPage: Number(o.valuePerPage) || 0,
    fixedAmount: Number(o.fixedAmount) || 0,
    disabled: Boolean(o.disabled),
    disabledAmount:
      typeof o.disabledAmount === "number" && Number.isFinite(o.disabledAmount)
        ? (o.disabledAmount as number)
        : 0, // legacy `disabled: true` records resolved below from full amount
  };
  // Backward compat: old records stored only `disabled: true`.
  if (doc.disabled && doc.disabledAmount <= 0) {
    doc.disabledAmount = getDocumentAmount(doc);
  }
  doc.disabledAmount = getDisabledAmount({ ...doc });
  doc.disabled = doc.disabledAmount > 0;
  return doc;
}

const DocumentsContext = createContext<{
  documents: DocumentItem[];
  addDocument: (input: DocumentInput) => Promise<DocumentItem>;
  updateDocument: (id: string, input: DocumentInput) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  deleteDocuments: (ids: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
  toggleDisabled: (id: string) => Promise<void>;
  setDisabledAmount: (id: string, amount: number) => Promise<void>;
  clearDisabled: (id: string) => Promise<void>;
  /**
   * Sets the gross total to `newTotal` by distributing the integer delta
   * across documents in reverse order (last → first), ±1 round-robin.
   * Returns the signed amount actually applied (less than requested when
   * a decrease is clamped at zero). Deduction-pool clamping is handled
   * separately by `DeductionCapacityGuard`.
   */
  adjustGrossTotal: (newTotal: number) => Promise<number>;
  load: () => Promise<void>;
} | null>(null);

/**
 * Ensures every document has a unique, contiguous order starting at 1.
 * Sorts by current order then reassigns 1, 2, 3, …
 */
function reindex(list: DocumentItem[]): DocumentItem[] {
  return [...list].sort((a, b) => a.order - b.order).map((d, i) => ({ ...d, order: i + 1 }));
}

export function DocumentsProvider({ children }: { readonly children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const load = useCallback(async () => {
    const raw = await store.getDocuments();
    const list = raw.map(parseDocument).filter((d): d is DocumentItem => d !== null);
    list.sort((a, b) => a.order - b.order);
    setDocuments(list);
  }, []);

  const persist = useCallback(async (list: DocumentItem[]) => {
    setDocuments(list);
    await store.setDocuments(list);
  }, []);

  // Order normalization is handled by the module-level `reindex` pure function.
  const addDocument = useCallback(
    async (input: DocumentInput): Promise<DocumentItem> => {
      const targetOrder = input.order;

      // Shift all existing documents whose order >= targetOrder up by 1
      const shifted = documents.map((d) =>
        d.order >= targetOrder ? { ...d, order: d.order + 1 } : d,
      );

      const doc: DocumentItem = {
        ...defaultDoc(),
        id: nanoid(),
        order: targetOrder,
        name: input.name,
        date: input.date,
        numberOfPages: input.numberOfPages,
        calculationMethod: input.calculationMethod,
        valuePerPage: input.valuePerPage,
        fixedAmount: input.fixedAmount,
        disabled: false,
        disabledAmount: 0,
      } as DocumentItem;

      // Re-index to guarantee a clean 1-based contiguous sequence
      const list = reindex([...shifted, doc]);
      await persist(list);
      const created = list.find((d) => d.id === doc.id);
      if (!created) throw new Error("Failed to create document");
      return created;
    },
    [documents, persist],
  );

  const updateDocument = useCallback(
    async (id: string, input: DocumentInput) => {
      const targetOrder = input.order;
      const oldOrder = documents.find((d) => d.id === id)?.order ?? targetOrder;

      const updated = documents.map((d) => {
        if (d.id === id) {
          // The document being edited gets its new order
          const next = {
            ...d,
            order: targetOrder,
            name: input.name,
            date: input.date,
            numberOfPages: input.numberOfPages,
            calculationMethod: input.calculationMethod,
            valuePerPage: input.valuePerPage,
            fixedAmount: input.fixedAmount,
          };
          // Keep the blocked amount, clamped to the new total:
          // a larger total leaves it unchanged, a smaller one pulls it down.
          const newTotal = getDocumentAmount(next);
          const clamped = Math.min(getDisabledAmount(d), newTotal);
          next.disabledAmount = newTotal > 0 ? Math.max(0, clamped) : 0;
          next.disabled = next.disabledAmount > 0;
          return next;
        }
        // Moving DOWN (e.g. 3 → 7): shift docs in range (oldOrder, targetOrder] up by -1
        if (targetOrder > oldOrder && d.order > oldOrder && d.order <= targetOrder) {
          return { ...d, order: d.order - 1 };
        }
        // Moving UP (e.g. 7 → 3): shift docs in range [targetOrder, oldOrder) down by +1
        if (targetOrder < oldOrder && d.order >= targetOrder && d.order < oldOrder) {
          return { ...d, order: d.order + 1 };
        }
        return d;
      });

      // Re-index to guarantee a clean 1-based contiguous sequence
      await persist(reindex(updated));
    },
    [documents, persist],
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      await persist(reindex(documents.filter((d) => d.id !== id)));
    },
    [documents, persist],
  );

  const deleteDocuments = useCallback(
    async (ids: string[]) => {
      const set = new Set(ids);
      await persist(reindex(documents.filter((d) => !set.has(d.id))));
    },
    [documents, persist],
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const toggleDisabled = useCallback(
    async (id: string) => {
      const list = documents.map((d) => {
        if (d.id !== id) return d;
        const total = getDocumentAmount(d);
        const nextAmount = getDisabledAmount(d) > 0 ? 0 : total;
        return { ...d, disabledAmount: nextAmount, disabled: nextAmount > 0 };
      });
      await persist(list);
    },
    [documents, persist],
  );

  const setDisabledAmount = useCallback(
    async (id: string, amount: number) => {
      const list = documents.map((d) => {
        if (d.id !== id) return d;
        const total = getDocumentAmount(d);
        if (total <= 0) return { ...d, disabledAmount: 0, disabled: false };
        const clamped = Math.min(Math.max(1, amount), total);
        return { ...d, disabledAmount: clamped, disabled: clamped > 0 };
      });
      await persist(list);
    },
    [documents, persist],
  );

  const clearDisabled = useCallback(
    async (id: string) => {
      const list = documents.map((d) =>
        d.id === id ? { ...d, disabledAmount: 0, disabled: false } : d,
      );
      await persist(list);
    },
    [documents, persist],
  );

  const adjustGrossTotal = useCallback(
    async (newTotal: number): Promise<number> => {
      if (!Number.isFinite(newTotal)) return 0;
      const target = Math.max(0, Math.round(newTotal));
      const delta = Math.round(target - getGrossTotal(documents));
      if (delta === 0) return 0;
      const { documents: next, applied } = distributeGrossTotalDelta(documents, delta);
      if (applied === 0) return 0;
      await persist(next);
      return applied;
    },
    [documents, persist],
  );

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      deleteDocuments,
      clearAll,
      toggleDisabled,
      setDisabledAmount,
      clearDisabled,
      adjustGrossTotal,
      load,
    }),
    [
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      deleteDocuments,
      clearAll,
      toggleDisabled,
      setDisabledAmount,
      clearDisabled,
      adjustGrossTotal,
      load,
    ],
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}

export { defaultDoc };
