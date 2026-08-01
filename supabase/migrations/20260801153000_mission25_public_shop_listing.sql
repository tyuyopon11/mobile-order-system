alter table public.shops
  add column if not exists show_on_public_site boolean not null default true;

comment on column public.shops.show_on_public_site is
  '一般向けLei Port TOP・Marketplace・商品購入導線へ掲載するか。管理画面とVendor Portalには影響しない。';

update public.shops
set show_on_public_site = false
where slug = 'test-exhibition'
   or btrim(shop_name) in ('テスト1', 'テスト１');
