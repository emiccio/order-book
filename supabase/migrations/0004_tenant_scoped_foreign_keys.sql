-- RLS evita que una usuaria LEA filas de otra, pero ninguna FK valida que
-- el id referenciado (cycle_id, customer_id, order_id, brand_id,
-- active_cycle_id) pertenezca a la misma usuaria: solo chequean que exista.
-- Una usuaria que conozca el UUID de un ciclo/clienta ajena (no es
-- enumerable, pero sí puede filtrarse) podría referenciarlo en una fila
-- propia — no lee nada ajeno, pero sí puede "clavar" una referencia que le
-- bloquee después un delete a la dueña real, vía la restricción de FK a
-- nivel de Postgres (que no mira RLS).
--
-- Mismo patrón que los triggers de 0002 y 0003: la Server Action ya hace
-- lo correcto en el camino normal: esto es la red de seguridad a nivel de
-- base para el caso en que no.

-- Un id por sí solo ya es único (primary key); agregar (id, user_id) como
-- unique habilita que otras tablas puedan exigir, vía FK compuesta, que lo
-- que referencian sea tanto ese id como esa misma usuaria.
alter table cycles add constraint cycles_id_user_id_key unique (id, user_id);
alter table customers add constraint customers_id_user_id_key unique (id, user_id);
alter table orders add constraint orders_id_user_id_key unique (id, user_id);
alter table brands add constraint brands_id_user_id_key unique (id, user_id);

-- orders.cycle_id / orders.customer_id: tienen que ser de la misma usuaria
-- que el pedido.
alter table orders drop constraint if exists orders_cycle_id_fkey;
alter table orders
  add constraint orders_cycle_id_user_id_fkey
  foreign key (cycle_id, user_id) references cycles (id, user_id);

alter table orders drop constraint if exists orders_customer_id_fkey;
alter table orders
  add constraint orders_customer_id_user_id_fkey
  foreign key (customer_id, user_id) references customers (id, user_id);

-- order_items.order_id / order_items.brand_id: brand_id es opcional
-- ("Sin marca"); con MATCH SIMPLE (el default), una fila con brand_id nulo
-- no activa el chequeo de la FK compuesta.
alter table order_items drop constraint if exists order_items_order_id_fkey;
alter table order_items
  add constraint order_items_order_id_user_id_fkey
  foreign key (order_id, user_id) references orders (id, user_id) on delete cascade;

alter table order_items drop constraint if exists order_items_brand_id_fkey;
alter table order_items
  add constraint order_items_brand_id_user_id_fkey
  foreign key (brand_id, user_id) references brands (id, user_id);

-- payments.order_id: mismo criterio.
alter table payments drop constraint if exists payments_order_id_fkey;
alter table payments
  add constraint payments_order_id_user_id_fkey
  foreign key (order_id, user_id) references orders (id, user_id) on delete cascade;

-- expenses.cycle_id: mismo criterio.
alter table expenses drop constraint if exists expenses_cycle_id_fkey;
alter table expenses
  add constraint expenses_cycle_id_user_id_fkey
  foreign key (cycle_id, user_id) references cycles (id, user_id);

-- profiles.active_cycle_id: el ciclo activo tiene que ser de esa misma
-- cuenta (profiles.id = el id de la usuaria). Cierra el hueco de
-- setActiveCycle, que hoy guarda el cycleId recibido sin validarlo.
alter table profiles drop constraint if exists profiles_active_cycle_id_fkey;
alter table profiles
  add constraint profiles_active_cycle_id_id_fkey
  foreign key (active_cycle_id, id) references cycles (id, user_id) on delete set null;
