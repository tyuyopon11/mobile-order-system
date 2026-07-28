-- ============================================================
-- Mission021.5: 花き業界向け販売単位・入数
-- 既存商品は「1鉢単位」として安全に移行する。
-- ============================================================

alter table public.exhibition_items
  add column if not exists sales_unit text not null default 'pot',
  add column if not exists units_per_sales_unit integer not null default 1;

update public.exhibition_items
set
  sales_unit = coalesce(nullif(sales_unit, ''), 'pot'),
  units_per_sales_unit = greatest(coalesce(units_per_sales_unit, 1), 1);

alter table public.exhibition_items
  drop constraint if exists exhibition_items_sales_unit_check,
  add constraint exhibition_items_sales_unit_check
    check (
      sales_unit in (
        'case',
        'pot',
        'tray',
        'bundle',
        'box',
        'pack',
        'stem',
        'piece'
      )
    ),
  drop constraint if exists exhibition_items_units_per_sales_unit_check,
  add constraint exhibition_items_units_per_sales_unit_check
    check (units_per_sales_unit >= 1);

comment on column public.exhibition_items.sales_unit is
  '販売単位。case/pot/tray/bundle/box/pack/stem/piece';
comment on column public.exhibition_items.units_per_sales_unit is
  '1販売単位あたりの実数量（入数）';
comment on column public.exhibition_items.quantity is
  '販売単位ベースの販売可能数（例: 3ケース）';
comment on column public.exhibition_items.price is
  '1販売単位あたりの販売価格';

-- 注文時点の販売条件を保持するスナップショット。
alter table public.exhibition_orders
  add column if not exists sales_unit text not null default 'pot',
  add column if not exists units_per_sales_unit integer not null default 1,
  add column if not exists total_units integer;

update public.exhibition_orders
set
  sales_unit = coalesce(nullif(sales_unit, ''), 'pot'),
  units_per_sales_unit = greatest(coalesce(units_per_sales_unit, 1), 1),
  total_units = coalesce(
    total_units,
    quantity * greatest(coalesce(units_per_sales_unit, 1), 1)
  );

alter table public.exhibition_orders
  drop constraint if exists exhibition_orders_sales_unit_check,
  add constraint exhibition_orders_sales_unit_check
    check (
      sales_unit in (
        'case',
        'pot',
        'tray',
        'bundle',
        'box',
        'pack',
        'stem',
        'piece'
      )
    ),
  drop constraint if exists exhibition_orders_units_per_sales_unit_check,
  add constraint exhibition_orders_units_per_sales_unit_check
    check (units_per_sales_unit >= 1),
  drop constraint if exists exhibition_orders_total_units_check,
  add constraint exhibition_orders_total_units_check
    check (total_units is null or total_units >= 1);

comment on column public.exhibition_orders.quantity is
  '注文した販売単位数（例: 3ケース）';
comment on column public.exhibition_orders.sales_unit is
  '注文時点の販売単位スナップショット';
comment on column public.exhibition_orders.units_per_sales_unit is
  '注文時点の入数スナップショット';
comment on column public.exhibition_orders.total_units is
  '実数量。quantity × units_per_sales_unit';
