import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../storage/store", () => ({
  getDocuments: vi.fn(async () => []),
  setDocuments: vi.fn(async () => {}),
  getCurrencies: vi.fn(async () => []),
  setCurrencies: vi.fn(async () => {}),
  getSettings: vi.fn(async () => ({})),
  setSettings: vi.fn(async () => {}),
  getDeductions: vi.fn(async () => []),
  setDeductions: vi.fn(async () => {}),
  getViewMode: vi.fn(async () => null),
  setViewMode: vi.fn(async () => {}),
}));

import * as store from "../storage/store";
import {
  applyBackup,
  buildBackup,
  type DatabaseBackup,
  DB_BACKUP_VERSION,
  validateBackup,
} from "./databaseBackup";

beforeEach(() => {
  vi.clearAllMocks();
});

function validBackup(): DatabaseBackup {
  return {
    version: DB_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      documents: [
        {
          id: "d1",
          order: 1,
          name: "doc",
          date: "2026-01-01",
          numberOfPages: 3,
          calculationMethod: "multiply",
          valuePerPage: 10,
          fixedAmount: 0,
          disabled: false,
          disabledAmount: 0,
        },
      ],
      currencies: [{ id: "c1", name: "USD", rateToPrimary: 1300, conversionOp: "divide" }],
      settings: { primaryCurrencyName: "د.ع", lastCalculationMethod: "multiply" },
      deductions: [{ id: "x1", amount: 50 }],
      viewMode: "grid",
    },
  };
}

describe("validateBackup", () => {
  it("accepts a valid backup", () => {
    const result = validateBackup(validBackup());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.documents).toHaveLength(1);
      expect(result.data.viewMode).toBe("grid");
    }
  });

  it("rejects a non-object payload", () => {
    const result = validateBackup(null);
    expect(result.ok).toBe(false);
  });

  it("rejects an unsupported version", () => {
    const result = validateBackup({ ...validBackup(), version: 999 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("إصدار");
  });

  it("rejects a missing documents array", () => {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    payload.data.documents = undefined;
    expect(validateBackup(payload).ok).toBe(false);
  });

  it("rejects duplicate document ids", () => {
    const payload = validBackup();
    payload.data.documents.push({ ...payload.data.documents[0] });
    const result = validateBackup(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("مكرر");
  });

  it("rejects non-finite numbers", () => {
    const payload = validBackup();
    payload.data.documents[0].fixedAmount = Number.NaN;
    expect(validateBackup(payload).ok).toBe(false);
  });

  it("rejects a negative deduction", () => {
    const payload = validBackup();
    payload.data.deductions[0].amount = -5;
    expect(validateBackup(payload).ok).toBe(false);
  });

  it("rejects an invalid currency rate", () => {
    const payload = validBackup();
    payload.data.currencies[0].rateToPrimary = 0;
    expect(validateBackup(payload).ok).toBe(false);
  });

  it("rejects an invalid viewMode", () => {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    payload.data.viewMode = "table";
    expect(validateBackup(payload).ok).toBe(false);
  });

  it("accepts a backup without settings or viewMode", () => {
    const payload = validBackup();
    // @ts-expect-error intentional partial payload
    delete payload.data.settings;
    // @ts-expect-error intentional partial payload
    delete payload.data.viewMode;
    const result = validateBackup(payload);
    expect(result.ok).toBe(true);
  });

  it("accepts a null viewMode", () => {
    const payload = validBackup();
    payload.data.viewMode = null;
    const result = validateBackup(payload);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.viewMode).toBeNull();
  });
});

describe("validateBackup document branches", () => {
  function withDocument(doc: unknown) {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    payload.data.documents = [doc];
    return validateBackup(payload);
  }

  function baseDoc() {
    return { ...validBackup().data.documents[0] };
  }

  it("rejects each invalid document shape with its exact message", () => {
    const cases: Array<[unknown, string]> = [
      [null, "المستند رقم 1: بنية غير صالحة"],
      [{ ...baseDoc(), id: "" }, "المستند رقم 1: المعرف (id) مفقود"],
      [{ ...baseDoc(), order: "1" }, "المستند رقم 1: الترتيب (order) غير صالح"],
      [{ ...baseDoc(), name: 5 }, "المستند رقم 1: الاسم غير صالح"],
      [{ ...baseDoc(), date: 20260101 }, "المستند رقم 1: التاريخ غير صالح"],
      [{ ...baseDoc(), numberOfPages: -1 }, "المستند رقم 1: عدد الصفحات غير صالح"],
      [{ ...baseDoc(), calculationMethod: "avg" }, "المستند رقم 1: طريقة الحساب غير صالحة"],
      [{ ...baseDoc(), valuePerPage: -2 }, "المستند رقم 1: القيمة لكل صفحة غير صالحة"],
      [{ ...baseDoc(), fixedAmount: Number.NaN }, "المستند رقم 1: المبلغ الثابت غير صالح"],
      [{ ...baseDoc(), disabled: "yes" }, "المستند رقم 1: حقل التعطيل غير صالح"],
      [{ ...baseDoc(), disabledAmount: -1 }, "المستند رقم 1: مبلغ التعطيل غير صالح"],
    ];
    for (const [doc, message] of cases) {
      expect(withDocument(doc)).toEqual({ ok: false, error: message });
    }
  });

  it("defaults missing disabled flags", () => {
    const doc = baseDoc();
    // @ts-expect-error intentional partial payload
    delete doc.disabled;
    // @ts-expect-error intentional partial payload
    delete doc.disabledAmount;
    const result = withDocument(doc);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.documents[0].disabled).toBe(false);
      expect(result.data.documents[0].disabledAmount).toBe(0);
    }
  });
});

describe("validateBackup currency and deduction branches", () => {
  it("rejects a non-record currency", () => {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    payload.data.currencies = [null];
    expect(validateBackup(payload)).toEqual({ ok: false, error: "العملة رقم 1: بنية غير صالحة" });
  });

  it("rejects each invalid currency with its exact message", () => {
    const bad = (patch: object) => {
      const payload = validBackup();
      Object.assign(payload.data.currencies[0], patch);
      return validateBackup(payload);
    };
    expect(bad({ id: "" })).toEqual({ ok: false, error: "العملة رقم 1: المعرف (id) مفقود" });
    expect(bad({ name: "" })).toEqual({ ok: false, error: "العملة رقم 1: الاسم مفقود" });
    expect(bad({ rateToPrimary: -3 })).toEqual({
      ok: false,
      error: "العملة رقم 1: سعر الصرف غير صالح",
    });
    expect(bad({ conversionOp: "add" })).toEqual({
      ok: false,
      error: "العملة رقم 1: عملية التحويل غير صالحة",
    });
  });

  it("rejects each invalid deduction with its exact message", () => {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    payload.data.deductions = [null];
    expect(validateBackup(payload)).toEqual({ ok: false, error: "الخصم رقم 1: بنية غير صالحة" });

    const missingId = validBackup();
    // @ts-expect-error intentional invalid payload
    missingId.data.deductions = [{ amount: 5 }];
    expect(validateBackup(missingId)).toEqual({
      ok: false,
      error: "الخصم رقم 1: المعرف (id) مفقود",
    });

    const negative = validBackup();
    negative.data.deductions = [{ id: "x", amount: -1 }];
    expect(validateBackup(negative)).toEqual({ ok: false, error: "الخصم رقم 1: المبلغ غير صالح" });
  });

  it("rejects a payload without data", () => {
    expect(validateBackup({ version: DB_BACKUP_VERSION })).toEqual({
      ok: false,
      error: "الملف لا يحتوي على بيانات قاعدة البيانات",
    });
  });

  it("rejects duplicate currency and deduction ids", () => {
    const dupCurrency = validBackup();
    dupCurrency.data.currencies.push({ ...dupCurrency.data.currencies[0] });
    expect(validateBackup(dupCurrency)).toEqual({ ok: false, error: "معرف عملة مكرر: c1" });

    const dupDeduction = validBackup();
    dupDeduction.data.deductions.push({ ...dupDeduction.data.deductions[0] });
    expect(validateBackup(dupDeduction)).toEqual({ ok: false, error: "معرف خصم مكرر: x1" });
  });

  it("rejects non-array sections and non-record settings", () => {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    payload.data.currencies = "x";
    expect(validateBackup(payload)).toEqual({
      ok: false,
      error: "حقل العملات (currencies) غير صالح",
    });

    const payload2 = validBackup();
    // @ts-expect-error intentional invalid payload
    payload2.data.deductions = 42;
    expect(validateBackup(payload2)).toEqual({
      ok: false,
      error: "حقل الخصومات (deductions) غير صالح",
    });

    const payload3 = validBackup();
    // @ts-expect-error intentional invalid payload
    payload3.data.settings = "x";
    expect(validateBackup(payload3)).toEqual({
      ok: false,
      error: "حقل الإعدادات (settings) غير صالح",
    });
  });

  it("rejects invalid settings fields", () => {
    const badName = validBackup();
    badName.data.settings = { primaryCurrencyName: "" };
    expect(validateBackup(badName)).toEqual({ ok: false, error: "اسم العملة الأساسية غير صالح" });

    const badMethod = validBackup();
    // @ts-expect-error intentional invalid payload
    badMethod.data.settings = { lastCalculationMethod: "avg" };
    expect(validateBackup(badMethod)).toEqual({
      ok: false,
      error: "طريقة الحساب الأخيرة غير صالحة",
    });
  });

  it("rejects a missing version", () => {
    const payload = validBackup();
    // @ts-expect-error intentional invalid payload
    delete payload.version;
    expect(validateBackup(payload)).toEqual({
      ok: false,
      error: "إصدار النسخة الاحتياطية غير مدعوم",
    });
  });
});

describe("buildBackup and applyBackup", () => {
  it("builds a versioned backup from storage", async () => {
    vi.mocked(store.getDocuments).mockResolvedValue([{ id: "d" }]);
    vi.mocked(store.getCurrencies).mockResolvedValue([{ id: "c" }]);
    vi.mocked(store.getSettings).mockResolvedValue({ primaryCurrencyName: "د.ع" });
    vi.mocked(store.getDeductions).mockResolvedValue([{ id: "x", amount: 1 }]);
    vi.mocked(store.getViewMode).mockResolvedValue("list");

    const backup = await buildBackup();
    expect(backup.version).toBe(DB_BACKUP_VERSION);
    expect(backup.data.documents).toEqual([{ id: "d" }]);
    expect(backup.data.viewMode).toBe("list");
  });

  it("normalizes non-array storage values to empty lists", async () => {
    vi.mocked(store.getDocuments).mockResolvedValue("oops" as unknown as unknown[]);
    vi.mocked(store.getCurrencies).mockResolvedValue(7 as unknown as unknown[]);
    vi.mocked(store.getDeductions).mockResolvedValue(null as unknown as never[]);
    const backup = await buildBackup();
    expect(backup.data.documents).toEqual([]);
    expect(backup.data.currencies).toEqual([]);
    expect(backup.data.deductions).toEqual([]);
  });

  it("applies validated data and the view mode", async () => {
    const result = validateBackup(validBackup());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    await applyBackup(result.data);
    expect(store.setDocuments).toHaveBeenCalledWith(result.data.documents);
    expect(store.setCurrencies).toHaveBeenCalledWith(result.data.currencies);
    expect(store.setSettings).toHaveBeenCalledWith(result.data.settings);
    expect(store.setDeductions).toHaveBeenCalledWith(result.data.deductions);
    expect(store.setViewMode).toHaveBeenCalledWith("grid");
  });

  it("skips persisting a null view mode", async () => {
    const result = validateBackup(validBackup());
    if (!result.ok) return;
    await applyBackup({ ...result.data, viewMode: null });
    expect(store.setViewMode).not.toHaveBeenCalled();
  });
});
