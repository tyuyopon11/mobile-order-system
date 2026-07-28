export const SALES_UNITS = [
  { value: "case", label: "ケース", itemLabel: "鉢" },
  { value: "pot", label: "鉢", itemLabel: "鉢" },
  { value: "tray", label: "トレー", itemLabel: "個" },
  { value: "bundle", label: "束", itemLabel: "本" },
  { value: "box", label: "箱", itemLabel: "個" },
  { value: "pack", label: "パック", itemLabel: "個" },
  { value: "stem", label: "本", itemLabel: "本" },
  { value: "piece", label: "個", itemLabel: "個" },
] as const;

export type SalesUnit = (typeof SALES_UNITS)[number]["value"];

export const DEFAULT_SALES_UNIT: SalesUnit = "pot";

export function isSalesUnit(value: string): value is SalesUnit {
  return SALES_UNITS.some((unit) => unit.value === value);
}

export function getSalesUnitLabel(value: string | null | undefined) {
  return (
    SALES_UNITS.find((unit) => unit.value === value)?.label ??
    SALES_UNITS.find((unit) => unit.value === DEFAULT_SALES_UNIT)!.label
  );
}

export function getContainedItemLabel(value: string | null | undefined) {
  return (
    SALES_UNITS.find((unit) => unit.value === value)?.itemLabel ?? "個"
  );
}

export function formatSalesUnitQuantity(
  quantity: number,
  salesUnit: string | null | undefined
) {
  return `${quantity}${getSalesUnitLabel(salesUnit)}`;
}

export function formatUnitsPerSalesUnit(
  unitsPerSalesUnit: number,
  salesUnit: string | null | undefined
) {
  if (salesUnit === "case") {
    return `1ケース${unitsPerSalesUnit}鉢入り`;
  }

  if (unitsPerSalesUnit <= 1) {
    return `1${getSalesUnitLabel(salesUnit)}単位`;
  }

  return `1${getSalesUnitLabel(salesUnit)}あたり${unitsPerSalesUnit}${getContainedItemLabel(
    salesUnit
  )}入り`;
}
