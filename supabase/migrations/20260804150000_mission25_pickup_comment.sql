alter table public.exhibition_items
  add column if not exists pickup_comment text;

comment on column public.exhibition_items.pickup_comment is
  'VendorまたはAdminが登録する、この商品を選んだ理由・おすすめコメント';
