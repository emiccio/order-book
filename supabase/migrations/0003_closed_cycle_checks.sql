-- Un ciclo cerrado no acepta pedidos ni gastos nuevos. La Server Action ya
-- chequea esto (mensaje en castellano); este trigger es la red de
-- seguridad a nivel de base, igual que el de pagos de la Etapa 5.

create or replace function public.check_cycle_open()
returns trigger
language plpgsql
as $$
declare
  cycle_status text;
begin
  select status into cycle_status from cycles where id = new.cycle_id;

  if cycle_status = 'closed' then
    raise exception 'El ciclo está cerrado.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger orders_require_open_cycle
  before insert on orders
  for each row execute function public.check_cycle_open();

create trigger expenses_require_open_cycle
  before insert on expenses
  for each row execute function public.check_cycle_open();
