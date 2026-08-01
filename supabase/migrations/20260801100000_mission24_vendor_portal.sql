-- Mission24: Admin / Shop / Buyer role separation
alter table public.platform_users
  add column if not exists shop_id uuid references public.shops(id) on delete set null;

create index if not exists platform_users_shop_id_idx
  on public.platform_users(shop_id)
  where shop_id is not null;

comment on column public.platform_users.shop_id is
  'role=shop の担当ショップ。Vendor Portalのサーバー側スコープに使用する。';

update public.platform_users
set role = 'shop'
where role in ('shop_admin', 'vendor');

