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
import type { DocumentItem } from "../utils/calculations";

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
});

function parseDocument(raw: unknown): DocumentItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.order !== "number") return null;
  return {
    id: o.id as string,
    order: o.order as number,
    name: String(o.name ?? ""),
    date: String(o.date ?? ""),
    numberOfPages: Number(o.numberOfPages) || 0,
    calculationMethod: o.calculationMethod === "fixed" ? "fixed" : "multiply",
    valuePerPage: Number(o.valuePerPage) || 0,
    fixedAmount: Number(o.fixedAmount) || 0,
    disabled: Boolean(o.disabled),
  };
}

const DocumentsContext = createContext<{
  documents: DocumentItem[];
  addDocument: (input: DocumentInput) => Promise<DocumentItem>;
  updateDocument: (id: string, input: DocumentInput) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  deleteDocuments: (ids: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
  toggleDisabled: (id: string) => Promise<void>;
  load: () => Promise<void>;
} | null>(null);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const load = useCallback(async () => {
    const raw = await store.getDocuments();
    const list = raw
      .map(parseDocument)
      .filter((d): d is DocumentItem => d !== null);
    list.sort((a, b) => a.order - b.order);
    setDocuments(list);
  }, []);

  const persist = useCallback(async (list: DocumentItem[]) => {
    setDocuments(list);
    await store.setDocuments(list);
  }, []);

  /**
   * Ensures every document has a unique, contiguous order starting at 1.
   * Sorts by current order then reassigns 1, 2, 3, …
   */
  const reindex = (list: DocumentItem[]): DocumentItem[] =>
    [...list]
      .sort((a, b) => a.order - b.order)
      .map((d, i) => ({ ...d, order: i + 1 }));

  const addDocument = useCallback(
    async (input: DocumentInput): Promise<DocumentItem> => {
      const targetOrder = input.order;

      // Shift all existing documents whose order >= targetOrder up by 1
      const shifted = documents.map((d) =>
        d.order >= targetOrder ? { ...d, order: d.order + 1 } : d
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
      } as DocumentItem;

      // Re-index to guarantee a clean 1-based contiguous sequence
      const list = reindex([...shifted, doc]);
      await persist(list);
      return list.find((d) => d.id === doc.id)!;
    },
    [documents, persist]
  );

  const updateDocument = useCallback(
    async (id: string, input: DocumentInput) => {
      const targetOrder = input.order;
      const oldOrder = documents.find((d) => d.id === id)?.order ?? targetOrder;

      let updated = documents.map((d) => {
        if (d.id === id) {
          // The document being edited gets its new order
          return {
            ...d,
            order: targetOrder,
            name: input.name,
            date: input.date,
            numberOfPages: input.numberOfPages,
            calculationMethod: input.calculationMethod,
            valuePerPage: input.valuePerPage,
            fixedAmount: input.fixedAmount,
          };
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
    [documents, persist]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      await persist(reindex(documents.filter((d) => d.id !== id)));
    },
    [documents, persist]
  );

  const deleteDocuments = useCallback(
    async (ids: string[]) => {
      const set = new Set(ids);
      await persist(reindex(documents.filter((d) => !set.has(d.id))));
    },
    [documents, persist]
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const toggleDisabled = useCallback(
    async (id: string) => {
      const list = documents.map((d) =>
        d.id === id ? { ...d, disabled: !d.disabled } : d
      );
      await persist(list);
    },
    [documents, persist]
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
      load,
    ]
  );

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx)
    throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}

export { defaultDoc };
