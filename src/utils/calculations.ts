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
    : doc.fixedAmount ?? 0;
}

export function getTotalPages(documents: DocumentItem[]): number {
  return documents
    .filter((d) => !d.disabled)
    .reduce((sum, d) => sum + (d.numberOfPages || 0), 0);
}

export function getTotalAmountPrimary(documents: DocumentItem[]): number {
  return documents
    .filter((d) => !d.disabled)
    .reduce((sum, d) => sum + getDocumentAmount(d), 0);
}

export function convertToCurrency(
  amountPrimary: number,
  currency: CurrencyItem
): number {
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
