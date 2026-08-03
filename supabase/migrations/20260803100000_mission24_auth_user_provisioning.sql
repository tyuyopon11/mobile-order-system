-- Authユーザー作成直後の初期platform_users行と、
-- 承認済みBuyerの業務必須項目を分離する。
alter table public.platform_users
  drop constraint if exists platform_users_company_name_not_blank;

alter table public.platform_users
  add constraint platform_users_company_name_not_blank
  check (
    nullif(btrim(company_name), '') is not null
    or approval_status is distinct from 'approved'
    or role in ('admin', 'shop')
  );

comment on constraint platform_users_company_name_not_blank
  on public.platform_users is
  '承認済みBuyerは会社名必須。Auth作成直後の未承認行、およびAdmin/Shopアカウントは初期プロビジョニング中の空欄を許可する。';
