type InventoryOrder = {
  quantity: number | string | null;
  status?: string | null;
  cancelled?: boolean | null;
};

export function isInventoryReservation(order: InventoryOrder): boolean {
  return order.cancelled !== true && order.status !== "cancelled";
}

export function calculateAvailableCases(
  initialQuantity: number | string | null,
  orders: InventoryOrder[] | null | undefined
): number | null {
  if (initialQuantity === null) return null;

  const initial = Math.max(0, Math.trunc(Number(initialQuantity) || 0));
  const reserved = (orders ?? [])
    .filter(isInventoryReservation)
    .reduce(
      (total, order) =>
        total + Math.max(0, Math.trunc(Number(order.quantity) || 0)),
      0
    );

  return Math.max(initial - reserved, 0);
}
