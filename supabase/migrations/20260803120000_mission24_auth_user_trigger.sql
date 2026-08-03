-- Mission24: auth.users -> platform_users の正式なプロビジョニング仕様
-- 権限に関わる role / shop_id / approval_status はAuth metadataを信用しない。

create or replace function public.handle_new_platform_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pending_label constant text := '設定待ち';
  initial_name text;
  initial_company_name text;
  initial_email text;
begin
  initial_email := coalesce(
    nullif(btrim(new.email), ''),
    new.id::text || '@pending.invalid'
  );

  initial_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    pending_label
  );

  initial_company_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''),
    pending_label
  );

  insert into public.platform_users (
    auth_user_id,
    email,
    name,
    company_name,
    buyer_no,
    branch_no,
    phone,
    role,
    shop_id,
    approval_status,
    is_active,
    approved_at,
    approved_by,
    rejected_at,
    rejected_by,
    rejection_reason,
    created_at,
    updated_at
  )
  values (
    new.id,
    initial_email,
    initial_name,
    initial_company_name,
    nullif(btrim(new.raw_user_meta_data ->> 'buyer_no'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'branch_no'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''),
    'buyer',
    null,
    'pending',
    false,
    null,
    null,
    null,
    null,
    null,
    now(),
    now()
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_platform_user() from public;
revoke all on function public.handle_new_platform_user() from anon;
revoke all on function public.handle_new_platform_user() from authenticated;

drop trigger if exists on_auth_user_created_create_platform_user on auth.users;

create trigger on_auth_user_created_create_platform_user
after insert on auth.users
for each row
execute function public.handle_new_platform_user();

-- Dashboard作成ユーザーは設定待ちで安全に作成できるが、
-- Buyerは正式プロフィールの入力前に承認済みにできないよう保証する。
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
    or role in ('admin', 'shop')
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
    or role in ('admin', 'shop')
  );

comment on function public.handle_new_platform_user() is
  'Authユーザー作成時に未承認・無効の初期platform_usersを生成する。Auth metadataから権限やshop_idは設定しない。';

comment on constraint platform_users_company_name_not_blank
  on public.platform_users is
  '承認済みBuyerは正式な会社名必須。未承認またはAdmin/Shopはプロビジョニング中の設定待ちを許可する。';

comment on constraint platform_users_name_not_blank
  on public.platform_users is
  '承認済みBuyerは正式な担当者名必須。未承認またはAdmin/Shopはプロビジョニング中の設定待ちを許可する。';
