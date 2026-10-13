-- No permitir que la suma de pagos de un pedido supere su total, ni siquiera
-- con dos pagos insertados casi al mismo tiempo. El chequeo en la Server
-- Action ya cubre el caso normal (y da un mensaje con el saldo); este
-- trigger es la red de seguridad para la carrera: bloquea la fila del
-- pedido con `for update`, así dos inserciones concurrentes del mismo
-- pedido quedan serializadas en vez de leer el mismo saldo viejo.

create or replace function public.check_payment_balance()
returns trigger
language plpgsql
as $$
declare
  order_total numeric(14,2);
  already_paid numeric(14,2);
begin
  perform 1 from orders where id = new.order_id for update;

  select coalesce(sum(quantity * unit_price), 0) into order_total
  from order_items where order_id = new.order_id;

  select coalesce(sum(amount), 0) into already_paid
  from payments
  where order_id = new.order_id
    and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if already_paid + new.amount > order_total then
    raise exception 'El pago supera el saldo pendiente del pedido (saldo: %)', (order_total - already_paid)
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger payments_balance_check
  before insert or update on payments
  for each row execute function public.check_payment_balance();
