import { formatAmount } from "./calculations";

/**
 * Accessibility label for the disable/enable document toggle.
 * Shows the remaining amount when the document is partially blocked.
 */
export function getToggleLabel(
  isPartial: boolean,
  showDisabledStyles: boolean,
  remaining: number,
): string {
  if (isPartial) {
    return `تفعيل، المتبقي ${formatAmount(remaining, 0)}`;
  }
  if (showDisabledStyles) {
    return "تفعيل";
  }
  return "تعطيل";
}
