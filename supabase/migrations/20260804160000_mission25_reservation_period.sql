alter table public.exhibition_items
  add column if not exists reservation_period_enabled boolean not null default false,
  add column if not exists reservation_start_date date,
  add column if not exists reservation_end_date date;

comment on column public.exhibition_items.reservation_period_enabled is '予約受付期間を使用するか';
comment on column public.exhibition_items.reservation_start_date is '予約受付開始日';
comment on column public.exhibition_items.reservation_end_date is '予約受付終了日';
