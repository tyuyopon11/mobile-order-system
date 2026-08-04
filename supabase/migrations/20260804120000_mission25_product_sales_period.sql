alter table public.exhibition_items
  add column if not exists sales_period_enabled boolean not null default false,
  add column if not exists sales_start_date date,
  add column if not exists sales_end_date date;

alter table public.exhibition_items
  drop constraint if exists exhibition_items_sales_period_dates_check;

alter table public.exhibition_items
  add constraint exhibition_items_sales_period_dates_check
  check (
    sales_period_enabled = false
    or (
      sales_start_date is not null
      and sales_end_date is not null
      and sales_end_date >= sales_start_date
    )
  );

comment on column public.exhibition_items.sales_period_enabled is '商品販売期間を使用するか。競り日・納品日とは独立した設定。';
comment on column public.exhibition_items.sales_start_date is '販売開始日（Asia/Tokyoの日付）';
comment on column public.exhibition_items.sales_end_date is '販売終了日（Asia/Tokyoの日付、開始日・終了日を含む）';
