export type CalculationMethod = "multiply" | "fixed";

export interface DocumentItem {
  id: string;
  order: number;
  name: string;
  date: string;
  numberOfPages: number;
  calculationMethod: CalculationMethod;
  valuePerPage: number;
  fixedAmount: number;
  disabled: boolean;
  disabledAmount: number;
}

export interface CurrencyItem {
  id: string;
  name: string;
  rateToPrimary: number;
  conversionOp: "multiply" | "divide";
}

export function getDocumentAmount(doc: DocumentItem): number {
  return doc.calculationMethod === "multiply"
    ? (doc.valuePerPage || 0) * (doc.numberOfPages || 0)
    : (doc.fixedAmount ?? 0);
}

function resolveRawDisabledAmount(doc: DocumentItem, total: number): number {
  if (typeof doc.disabledAmount === "number" && Number.isFinite(doc.disabledAmount)) {
    return doc.disabledAmount;
  }
  if (doc.disabled) {
    return total;
  }
  return 0;
}

export function getDisabledAmount(doc: DocumentItem): number {
  const total = getDocumentAmount(doc);
  const raw = resolveRawDisabledAmount(doc, total);
  if (raw <= 0 || total <= 0) return 0;
  return Math.min(raw, total);
}

export function isPartiallyBlocked(doc: DocumentItem, allocation: Map<string, number>): boolean {
  const combined = getCombinedBlocked(doc, allocation);
  return combined > 0 && combined < getDocumentAmount(doc);
}

export function isFullyBlocked(doc: DocumentItem, allocation: Map<string, number>): boolean {
  const total = getDocumentAmount(doc);
  return total > 0 && getCombinedBlocked(doc, allocation) >= total;
}

export function getGrossTotal(documents: DocumentItem[]): number {
  return documents.reduce((sum, d) => sum + getDocumentAmount(d), 0);
}

export function getManualBlockedTotal(documents: DocumentItem[]): number {
  return documents.reduce((sum, d) => sum + getDisabledAmount(d), 0);
}

/** Free capacity the deductions pool may occupy: gross minus manual blocks. */
export function getDeductionCapacity(documents: DocumentItem[]): number {
  return Math.max(0, getGrossTotal(documents) - getManualBlockedTotal(documents));
}

/**
 * Sequentially allocates the deductions pool across documents in `order`:
 * each doc absorbs up to (total − manual), first docs fill first.
 * Returns auto-blocked amount per document id. Σ values = min(pool, capacity).
 */
export function allocateDeductionBlocks(
  documents: DocumentItem[],
  pool: number,
): Map<string, number> {
  const result = new Map<string, number>();
  let remaining = Math.max(0, pool);
  const sorted = [...documents].sort((a, b) => a.order - b.order);
  for (const doc of sorted) {
    if (remaining <= 0) break;
    const room = Math.max(0, getDocumentAmount(doc) - getDisabledAmount(doc));
    if (room <= 0) continue;
    const take = Math.min(room, remaining);
    result.set(doc.id, take);
    remaining -= take;
  }
  return result;
}

export function getAutoBlocked(doc: DocumentItem, allocation: Map<string, number>): number {
  const raw = allocation.get(doc.id) ?? 0;
  const room = Math.max(0, getDocumentAmount(doc) - getDisabledAmount(doc));
  if (raw <= 0 || room <= 0) return 0;
  return Math.min(raw, room);
}

/** Combined blocked amount: manual disable + deduction-driven auto block. */
export function getCombinedBlocked(doc: DocumentItem, allocation: Map<string, number>): number {
  return getDisabledAmount(doc) + getAutoBlocked(doc, allocation);
}

/** Remaining countable amount after manual + auto blocks. */
export function getNetRemaining(doc: DocumentItem, allocation: Map<string, number>): number {
  return Math.max(0, getDocumentAmount(doc) - getCombinedBlocked(doc, allocation));
}

export interface DeductionLike {
  id: string;
  amount: number;
}

/**
 * Enforces pool ≤ capacity, newest-first (LIFO): shrink the most recent
 * deduction; one reduced below 1 is removed and clamping continues.
 */
export function clampDeductionPool<T extends DeductionLike>(
  deductions: T[],
  capacity: number,
): T[] {
  const cap = Math.max(0, capacity);
  let pool = deductions.reduce((s, d) => s + (d.amount || 0), 0);
  if (pool <= cap) return deductions;
  const list = [...deductions];
  for (let i = list.length - 1; i >= 0 && pool > cap; i--) {
    const excess = pool - cap;
    const next = Math.max(0, (list[i].amount || 0) - excess);
    pool -= list[i].amount || 0;
    if (next < 1) {
      list.splice(i, 1); // cannot keep a deduct below 1 — drop it
    } else {
      list[i] = { ...list[i], amount: next };
      pool += next;
    }
  }
  return list;
}

export function getTotalPages(documents: DocumentItem[]): number {
  return documents.reduce((sum, d) => sum + (d.numberOfPages || 0), 0);
}

export interface TotalDeltaResult {
  documents: DocumentItem[];
  /** Signed amount actually applied (may be less than requested on clamped decrease). */
  applied: number;
  requested: number;
}

function isZeroPageMultiply(doc: DocumentItem): boolean {
  return doc.calculationMethod === "multiply" && doc.numberOfPages <= 0;
}

function clampDisabledToTotal(doc: DocumentItem): DocumentItem {
  const total = getDocumentAmount(doc);
  if (total <= 0) return { ...doc, disabledAmount: 0, disabled: false };
  const clamped = Math.min(getDisabledAmount(doc), total);
  const next = Math.max(0, clamped);
  return { ...doc, disabledAmount: next, disabled: next > 0 };
}

/**
 * Distributes an integer gross-total delta across documents in reverse
 * `order` (last → first), one whole unit at a time, round-robin.
 *
 * - Increase: every eligible doc gets `+1` per pass; first `remainder`
 *   docs (from the last) get one extra. A `multiply` doc with
 *   `pages <= 0` cannot scale (`0 × x = 0`) and is skipped.
 * - Decrease: round-robin `−1` over docs with `amount > 0`; each doc
 *   floors at 0. If `|delta|` exceeds the gross total the result is
 *   clamped (all docs → 0, `applied` < `requested`).
 * - Field updates: `fixed` → `fixedAmount ± share`; `multiply` with
 *   `pages > 0` → `valuePerPage ±= share / pages` (may become
 *   fractional, amount delta stays an exact whole number). Manual
 *   `disabledAmount` is clamped to the new per-doc total.
 */
export function distributeGrossTotalDelta(
  documents: DocumentItem[],
  delta: number,
): TotalDeltaResult {
  const requested = Math.round(delta || 0);
  if (requested === 0 || documents.length === 0) {
    return { documents: documents.map((d) => ({ ...d })), applied: 0, requested };
  }
  const sorted = [...documents].sort((a, b) => b.order - a.order);
  const byId = new Map<string, DocumentItem>(sorted.map((d) => [d.id, { ...d }]));

  if (requested > 0) {
    const { documents: next, applied } = distributeIncrease(documents, sorted, byId, requested);
    return { documents: next, applied, requested };
  }
  const { documents: next, applied } = distributeDecrease(documents, sorted, byId, requested);
  return { documents: next, applied, requested };
}

function distributeIncrease(
  documents: DocumentItem[],
  sorted: DocumentItem[],
  byId: Map<string, DocumentItem>,
  requested: number,
): { documents: DocumentItem[]; applied: number } {
  const working = (id: string): DocumentItem | undefined => byId.get(id);
  const eligible = selectEligibleDocs(sorted, working, false);
  if (eligible.length === 0) {
    return { documents: documents.map((d) => ({ ...d })), applied: 0 };
  }
  const passes = Math.floor(requested / eligible.length);
  const remainder = requested % eligible.length;
  eligible.forEach((d, i) => {
    const share = passes + (i < remainder ? 1 : 0);
    if (share <= 0) return;
    const doc = working(d.id);
    if (doc === undefined) return;
    if (doc.calculationMethod === "fixed") {
      doc.fixedAmount = (doc.fixedAmount || 0) + share;
    } else {
      doc.valuePerPage = (doc.valuePerPage || 0) + share / doc.numberOfPages;
    }
    byId.set(d.id, clampDisabledToTotal(doc));
  });
  return finishDistribution(documents, working);
}

function selectEligibleDocs(
  sorted: DocumentItem[],
  working: (id: string) => DocumentItem | undefined,
  requireAmount: boolean,
): DocumentItem[] {
  return sorted.filter((d) => {
    const doc = working(d.id);
    if (doc === undefined || isZeroPageMultiply(doc)) return false;
    return !requireAmount || getDocumentAmount(doc) > 1e-9;
  });
}

function finishDistribution(
  documents: DocumentItem[],
  working: (id: string) => DocumentItem | undefined,
): { documents: DocumentItem[]; applied: number } {
  const result = documents.map((d) => working(d.id) ?? { ...d });
  const applied = Math.round(getGrossTotal(result) - getGrossTotal(documents));
  return { documents: result, applied };
}

function takeOneFromDoc(doc: DocumentItem, need: number, byId: Map<string, DocumentItem>): number {
  const amount = getDocumentAmount(doc);
  if (amount <= 0 || isZeroPageMultiply(doc)) return 0;
  const take = Math.min(1, amount, need);
  if (take <= 0) return 0;
  if (doc.calculationMethod === "fixed") {
    doc.fixedAmount = Math.max(0, (doc.fixedAmount || 0) - take);
  } else {
    doc.valuePerPage = Math.max(0, (doc.valuePerPage || 0) - take / doc.numberOfPages);
    // Snap tiny float residue to exact zero so docs fully clear.
    if (getDocumentAmount(doc) < 1e-9) doc.valuePerPage = 0;
  }
  byId.set(doc.id, clampDisabledToTotal(doc));
  return take;
}

// Decrease path: round-robin −1 from the last doc, each doc floors at 0.
// Fractional takes only occur when a doc holds < 1 (it then hits 0).
function distributeDecrease(
  documents: DocumentItem[],
  sorted: DocumentItem[],
  byId: Map<string, DocumentItem>,
  requested: number,
): { documents: DocumentItem[]; applied: number } {
  const working = (id: string): DocumentItem | undefined => byId.get(id);
  let need = -requested;
  while (need > 1e-9) {
    const eligible = selectEligibleDocs(sorted, working, true);
    if (eligible.length === 0) break;
    const pass = runDecreasePass(eligible, working, byId, need);
    need = pass.need;
    if (!pass.progressed) break;
  }
  return finishDistribution(documents, working);
}

function runDecreasePass(
  eligible: DocumentItem[],
  working: (id: string) => DocumentItem | undefined,
  byId: Map<string, DocumentItem>,
  need: number,
): { need: number; progressed: boolean } {
  let progressed = false;
  for (const d of eligible) {
    if (need <= 1e-9) break;
    const doc = working(d.id);
    if (doc === undefined) continue;
    const taken = takeOneFromDoc(doc, need, byId);
    if (taken > 0) {
      need -= taken;
      progressed = true;
    }
  }
  return { need, progressed };
}

export function convertToCurrency(amountPrimary: number, currency: CurrencyItem): number {
  const { rateToPrimary, conversionOp } = currency;
  if (rateToPrimary === 0) return 0;
  return conversionOp === "multiply"
    ? amountPrimary * rateToPrimary
    : amountPrimary / rateToPrimary;
}

export function formatAmount(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
