-- Mission23: authoritative Tokyo Flower Port auction dates
create table if not exists public.auction_dates (
  auction_date date primary key,
  is_active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.auction_dates is
  '東京フラワーポート園芸部の注文受付対象となる競り日。';

create index if not exists auction_dates_active_date_idx
  on public.auction_dates(is_active, auction_date);

alter table public.auction_dates enable row level security;

drop policy if exists "authenticated users read active auction dates"
  on public.auction_dates;
create policy "authenticated users read active auction dates"
  on public.auction_dates
  for select
  to authenticated
  using (is_active = true);

grant select on public.auction_dates to authenticated;

-- 適用日から1年先までの火曜日・土曜日を初期登録する。
-- 臨時休市日は is_active=false に変更して運用する。
insert into public.auction_dates (auction_date, is_active)
select
  candidate::date,
  true
from generate_series(
  current_date,
  current_date + interval '1 year',
  interval '1 day'
) as candidate
where extract(dow from candidate) in (2, 6)
on conflict (auction_date) do nothing;
