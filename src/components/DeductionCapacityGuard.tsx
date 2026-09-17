import { useEffect } from "react";
import { useDeductions } from "../context/DeductionsContext";
import { useDocuments } from "../context/DocumentsContext";
import { getDeductionCapacity } from "../utils/calculations";

/**
 * Keeps the deductions pool within document capacity (gross − manual blocks).
 * Document edits/deletes or manual-disable increases can shrink capacity
 * below the pool — the guard clamps newest-first so the invariant holds.
 */
export function DeductionCapacityGuard() {
  const { documents } = useDocuments();
  const { deductions, clampPoolToCapacity } = useDeductions();

  const capacity = getDeductionCapacity(documents);
  const pool = deductions.reduce((s, d) => s + (d.amount || 0), 0);

  useEffect(() => {
    if (pool > capacity) {
      clampPoolToCapacity(capacity);
    }
  }, [pool, capacity, clampPoolToCapacity]);

  return null;
}
