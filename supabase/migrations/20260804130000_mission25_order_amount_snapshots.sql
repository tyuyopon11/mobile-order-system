alter table public.exhibition_orders
  add column if not exists unit_price numeric(12, 2),
  add column if not exists total_amount numeric(14, 2);

alter table public.exhibition_orders
  drop constraint if exists exhibition_orders_unit_price_check,
  add constraint exhibition_orders_unit_price_check
    check (unit_price is null or unit_price >= 0),
  drop constraint if exists exhibition_orders_total_amount_check,
  add constraint exhibition_orders_total_amount_check
    check (total_amount is null or total_amount >= 0);

comment on column public.exhibition_orders.unit_price is
  '注文時点の商品単価（税抜・1鉢等の実数単位あたり）';
comment on column public.exhibition_orders.total_amount is
  '注文時点の税抜金額。unit_price × units_per_sales_unit × quantity';

-- 過去注文は推測で補正せずNULLのまま維持する。
-- 新規注文はServer Actionで注文時点の単価・金額を保存する。
