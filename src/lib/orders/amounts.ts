export type OrderAmountInput = {
  unitPrice: number | null | undefined;
  unitsPerSalesUnit: number | null | undefined;
  quantity: number | null | undefined;
};

function nonNegativeNumber(value: number | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function calculateTotalUnits(
  unitsPerSalesUnit: number | null | undefined,
  quantity: number | null | undefined
) {
  return nonNegativeNumber(unitsPerSalesUnit) * nonNegativeNumber(quantity);
}

export function calculateLineAmount(input: OrderAmountInput) {
  return nonNegativeNumber(input.unitPrice) *
    calculateTotalUnits(input.unitsPerSalesUnit, input.quantity);
}

export function resolveOrderUnitPrice(
  savedUnitPrice: number | null | undefined,
  currentProductPrice: number | null | undefined
) {
  return savedUnitPrice === null || savedUnitPrice === undefined
    ? nonNegativeNumber(currentProductPrice)
    : nonNegativeNumber(savedUnitPrice);
}

export function resolveOrderAmount({
  savedAmount,
  savedUnitPrice,
  currentProductPrice,
  unitsPerSalesUnit,
  quantity,
}: {
  savedAmount: number | null | undefined;
  savedUnitPrice: number | null | undefined;
  currentProductPrice: number | null | undefined;
  unitsPerSalesUnit: number | null | undefined;
  quantity: number | null | undefined;
}) {
  if (savedAmount !== null && savedAmount !== undefined) {
    return nonNegativeNumber(savedAmount);
  }
  return calculateLineAmount({
    unitPrice: resolveOrderUnitPrice(savedUnitPrice, currentProductPrice),
    unitsPerSalesUnit,
    quantity,
  });
}
