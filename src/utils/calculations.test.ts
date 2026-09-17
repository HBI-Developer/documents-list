import { describe, expect, it } from "vitest";
import {
  allocateDeductionBlocks,
  clampDeductionPool,
  convertToCurrency,
  type DocumentItem,
  distributeGrossTotalDelta,
  formatAmount,
  getAutoBlocked,
  getCombinedBlocked,
  getDeductionCapacity,
  getDisabledAmount,
  getDocumentAmount,
  getGrossTotal,
  getManualBlockedTotal,
  getNetRemaining,
  getTotalPages,
  isFullyBlocked,
  isPartiallyBlocked,
} from "./calculations";

function doc(p: Partial<DocumentItem>): DocumentItem {
  return {
    id: "x",
    order: 1,
    name: "t",
    date: "2026-01-01",
    numberOfPages: 0,
    calculationMethod: "multiply",
    valuePerPage: 0,
    fixedAmount: 0,
    disabled: false,
    disabledAmount: 0,
    ...p,
  };
}

describe("getDocumentAmount", () => {
  it("multiplies value-per-page by pages", () => {
    expect(
      getDocumentAmount(doc({ calculationMethod: "multiply", valuePerPage: 10, numberOfPages: 3 })),
    ).toBe(30);
  });

  it("returns the fixed amount", () => {
    expect(getDocumentAmount(doc({ calculationMethod: "fixed", fixedAmount: 99 }))).toBe(99);
  });
});

describe("getDisabledAmount", () => {
  it("returns the manual amount within the total", () => {
    expect(
      getDisabledAmount(
        doc({ calculationMethod: "fixed", fixedAmount: 100, disabled: true, disabledAmount: 40 }),
      ),
    ).toBe(40);
  });

  it("clamps the manual amount to the total", () => {
    expect(
      getDisabledAmount(
        doc({ calculationMethod: "fixed", fixedAmount: 100, disabled: true, disabledAmount: 500 }),
      ),
    ).toBe(100);
  });

  it("returns 0 for a zero total", () => {
    expect(
      getDisabledAmount(
        doc({ calculationMethod: "fixed", fixedAmount: 0, disabled: true, disabledAmount: 5 }),
      ),
    ).toBe(0);
  });

  it("resolves legacy disabled records from the full amount", () => {
    expect(
      getDisabledAmount(
        doc({ calculationMethod: "fixed", fixedAmount: 60, disabled: true, disabledAmount: NaN }),
      ),
    ).toBe(60);
    expect(
      getDisabledAmount(
        doc({ calculationMethod: "fixed", fixedAmount: 60, disabled: false, disabledAmount: NaN }),
      ),
    ).toBe(0);
  });
});

describe("deduction allocation", () => {
  const docs = [
    doc({ id: "a", order: 1, calculationMethod: "fixed", fixedAmount: 50 }),
    doc({ id: "b", order: 2, calculationMethod: "fixed", fixedAmount: 50 }),
  ];

  it("fills documents in order", () => {
    const alloc = allocateDeductionBlocks(docs, 70);
    expect(alloc.get("a")).toBe(50);
    expect(alloc.get("b")).toBe(20);
  });

  it("computes capacity, gross and manual totals", () => {
    expect(getDeductionCapacity(docs)).toBe(100);
    expect(getGrossTotal(docs)).toBe(100);
    expect(getManualBlockedTotal(docs)).toBe(0);
  });

  it("combines manual and auto blocks", () => {
    const alloc = allocateDeductionBlocks(docs, 70);
    expect(getCombinedBlocked(docs[0], alloc)).toBe(50);
    expect(getNetRemaining(docs[1], alloc)).toBe(30);
  });

  it("clamps the pool newest-first (LIFO)", () => {
    const clamped = clampDeductionPool(
      [
        { id: "1", amount: 60 },
        { id: "2", amount: 60 },
      ],
      100,
    );
    expect(clamped.map((d) => d.amount)).toEqual([60, 40]);
  });
});

describe("distributeGrossTotalDelta", () => {
  const docs = [
    doc({ id: "a", order: 1, calculationMethod: "fixed", fixedAmount: 50 }),
    doc({ id: "b", order: 2, calculationMethod: "fixed", fixedAmount: 50 }),
  ];

  it("applies an increase exactly", () => {
    const r = distributeGrossTotalDelta(docs, 5);
    expect(r.applied).toBe(5);
    expect(getGrossTotal(r.documents)).toBe(105);
  });

  it("clamps a decrease at zero", () => {
    const r = distributeGrossTotalDelta(docs, -500);
    expect(getGrossTotal(r.documents)).toBe(0);
    expect(r.applied).toBe(-100);
  });
});

describe("currency conversion", () => {
  it("multiplies and divides by the rate", () => {
    expect(
      convertToCurrency(100, { id: "c", name: "x", rateToPrimary: 2, conversionOp: "multiply" }),
    ).toBe(200);
    expect(
      convertToCurrency(100, { id: "c", name: "x", rateToPrimary: 2, conversionOp: "divide" }),
    ).toBe(50);
  });

  it("returns 0 for a zero rate", () => {
    expect(
      convertToCurrency(100, { id: "c", name: "x", rateToPrimary: 0, conversionOp: "divide" }),
    ).toBe(0);
  });
});

describe("formatAmount", () => {
  it("formats with grouping and 2 decimals", () => {
    expect(formatAmount(1234.5)).toBe("1,234.50");
  });

  it("falls back for non-finite values", () => {
    expect(formatAmount(Number.NaN)).toBe("0.00");
    expect(formatAmount(Number.POSITIVE_INFINITY)).toBe("0.00");
  });
});

describe("blocked predicates", () => {
  const full = doc({ id: "f", calculationMethod: "fixed", fixedAmount: 50 });
  const alloc = new Map([["f", 50]]);

  it("detects fully blocked documents", () => {
    expect(isFullyBlocked(full, alloc)).toBe(true);
    expect(isPartiallyBlocked(full, alloc)).toBe(false);
  });

  it("detects partially blocked documents", () => {
    const half = new Map([["f", 20]]);
    expect(isFullyBlocked(full, half)).toBe(false);
    expect(isPartiallyBlocked(full, half)).toBe(true);
  });

  it("detects unblocked documents", () => {
    expect(isFullyBlocked(full, new Map())).toBe(false);
    expect(isPartiallyBlocked(full, new Map())).toBe(false);
  });

  it("clamps auto-blocked amounts to the free room", () => {
    expect(getAutoBlocked(full, new Map([["f", 500]]))).toBe(50);
    expect(getAutoBlocked(full, new Map())).toBe(0);
  });
});

describe("getTotalPages", () => {
  it("sums page counts", () => {
    expect(getTotalPages([doc({ numberOfPages: 3 }), doc({ numberOfPages: 7 }), doc({})])).toBe(10);
  });
});

describe("allocation edge cases", () => {
  it("returns an empty map for an empty pool", () => {
    const docs = [doc({ id: "a", calculationMethod: "fixed", fixedAmount: 50 })];
    expect(allocateDeductionBlocks(docs, 0).size).toBe(0);
  });

  it("skips documents without free room", () => {
    const docs = [
      doc({
        id: "a",
        order: 1,
        calculationMethod: "fixed",
        fixedAmount: 50,
        disabled: true,
        disabledAmount: 50,
      }),
      doc({ id: "b", order: 2, calculationMethod: "fixed", fixedAmount: 50 }),
    ];
    const alloc = allocateDeductionBlocks(docs, 30);
    expect(alloc.has("a")).toBe(false);
    expect(alloc.get("b")).toBe(30);
  });

  it("removes deductions that drop below 1 when clamping", () => {
    const clamped = clampDeductionPool(
      [
        { id: "1", amount: 60 },
        { id: "2", amount: 60 },
      ],
      30,
    );
    expect(clamped).toEqual([{ id: "1", amount: 30 }]);
  });

  it("returns the list untouched when within capacity", () => {
    const list = [{ id: "1", amount: 20 }];
    expect(clampDeductionPool(list, 100)).toBe(list);
  });
});

describe("distributeGrossTotalDelta edge cases", () => {
  it("does nothing for a zero delta or empty list", () => {
    const docs = [doc({ id: "a", calculationMethod: "fixed", fixedAmount: 50 })];
    const zero = distributeGrossTotalDelta(docs, 0);
    expect(zero.applied).toBe(0);
    expect(getGrossTotal(zero.documents)).toBe(50);
    const empty = distributeGrossTotalDelta([], 10);
    expect(empty.applied).toBe(0);
    expect(empty.requested).toBe(10);
    expect(empty.documents).toEqual([]);
  });

  it("scales multiply documents through value-per-page", () => {
    const docs = [
      doc({
        id: "a",
        order: 1,
        calculationMethod: "multiply",
        valuePerPage: 10,
        numberOfPages: 2,
      }),
    ];
    const r = distributeGrossTotalDelta(docs, 6);
    expect(r.applied).toBe(6);
    expect(r.documents[0].valuePerPage).toBe(13);
  });

  it("applies nothing when no document can take an increase", () => {
    const docs = [
      doc({ id: "a", order: 1, calculationMethod: "multiply", valuePerPage: 10, numberOfPages: 0 }),
    ];
    const r = distributeGrossTotalDelta(docs, 5);
    expect(r.applied).toBe(0);
    expect(r.requested).toBe(5);
    expect(getGrossTotal(r.documents)).toBe(0);
  });

  it("skips zero-page multiply documents on increase", () => {
    const docs = [
      doc({ id: "a", order: 1, calculationMethod: "multiply", valuePerPage: 10, numberOfPages: 0 }),
      doc({ id: "b", order: 2, calculationMethod: "fixed", fixedAmount: 10 }),
    ];
    const r = distributeGrossTotalDelta(docs, 5);
    expect(r.applied).toBe(5);
    expect(r.documents.find((d) => d.id === "b")?.fixedAmount).toBe(15);
    expect(r.documents.find((d) => d.id === "a")?.valuePerPage).toBe(10);
  });

  it("decreases multiply documents through value-per-page", () => {
    const docs = [
      doc({
        id: "a",
        order: 1,
        calculationMethod: "multiply",
        valuePerPage: 10,
        numberOfPages: 5,
      }),
    ];
    const r = distributeGrossTotalDelta(docs, -7);
    expect(r.applied).toBe(-7);
    expect(r.documents[0].valuePerPage).toBeCloseTo(8.6, 9);
  });

  it("clamps manual blocks when a decrease shrinks the total", () => {
    const docs = [
      doc({
        id: "a",
        order: 1,
        calculationMethod: "fixed",
        fixedAmount: 50,
        disabled: true,
        disabledAmount: 40,
      }),
    ];
    const r = distributeGrossTotalDelta(docs, -30);
    expect(r.applied).toBe(-30);
    expect(r.documents[0].disabledAmount).toBe(20);
    expect(r.documents[0].disabled).toBe(true);
  });
});
