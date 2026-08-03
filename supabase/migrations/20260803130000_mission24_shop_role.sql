-- Mission24の正式Shop担当者roleは `shop`。
-- 既存roleを削除せず、旧 `shop_admin` も互換性のため許可する。
alter table public.platform_users
  drop constraint if exists platform_users_role_check;

alter table public.platform_users
  add constraint platform_users_role_check
  check (
    role in (
      'admin',
      'buyer',
      'shop',
      'shop_admin',
      'producer',
      'vendor',
      'corporate'
    )
  );

comment on constraint platform_users_role_check
  on public.platform_users is
  'Mission24の正式Shop担当者roleはshop。shop_adminは既存データ互換のため許可する。';

-- 旧shop_adminアカウントも、既存互換のShop権限として同じ初期設定ルールを適用する。
alter table public.platform_users
  drop constraint if exists platform_users_company_name_not_blank;

alter table public.platform_users
  add constraint platform_users_company_name_not_blank
  check (
    (
      nullif(btrim(company_name), '') is not null
      and btrim(company_name) <> '設定待ち'
    )
    or approval_status is distinct from 'approved'
    or role in ('admin', 'shop', 'shop_admin')
  );

alter table public.platform_users
  drop constraint if exists platform_users_name_not_blank;

alter table public.platform_users
  add constraint platform_users_name_not_blank
  check (
    (
      nullif(btrim(name), '') is not null
      and btrim(name) <> '設定待ち'
    )
    or approval_status is distinct from 'approved'
    or role in ('admin', 'shop', 'shop_admin')
  );
