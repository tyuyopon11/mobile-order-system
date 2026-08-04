-- Mission25-05: reserve case inventory atomically from the immutable master quantity.
create index if not exists exhibition_orders_active_item_idx
  on public.exhibition_orders(item_id)
  where coalesce(cancelled, false) = false and coalesce(status, '') <> 'cancelled';

-- Protect every current insertion path, including the existing Server Action.
create or replace function public.enforce_exhibition_order_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_initial integer;
  v_reserved integer;
  v_available integer;
begin
  select coalesce(i.quantity, 0) into v_initial
  from public.exhibition_items i
  where i.id = new.item_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'item not found';
  end if;

  select coalesce(sum(o.quantity), 0)::integer into v_reserved
  from public.exhibition_orders o
  where o.item_id = new.item_id
    and coalesce(o.cancelled, false) = false
    and coalesce(o.status, '') <> 'cancelled'
    and (tg_op = 'INSERT' or o.id <> old.id);
  v_available := greatest(v_initial - v_reserved, 0);

  if coalesce(new.cancelled, false) = false
     and coalesce(new.status, '') <> 'cancelled'
     and new.quantity > v_available then
    raise exception using errcode = 'P0001',
      message = 'INSUFFICIENT_STOCK:' || v_available::text;
  end if;
  return new;
end;
$$;

drop trigger if exists exhibition_orders_inventory_guard on public.exhibition_orders;
create trigger exhibition_orders_inventory_guard
before insert or update of item_id, quantity, status, cancelled
on public.exhibition_orders
for each row execute function public.enforce_exhibition_order_inventory();
