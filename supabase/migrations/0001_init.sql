-- Esquema completo de la V1 (plan Etapa 2).
-- Cada tabla lleva user_id y una política de Row Level Security
-- "user_id = auth.uid()": el aislamiento por usuaria lo garantiza la base,
-- no el código de la app.

create extension if not exists pgcrypto;

-- ============================================================
-- profiles
-- ============================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- La fila de profiles se crea sola al registrarse: así no hay forma de que
-- exista una cuenta sin perfil, ni siquiera si falla algo en el medio.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- cycles
-- ============================================================

create table cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  status text not null default 'open' check (status in ('open', 'closed')),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table cycles enable row level security;

create policy "cycles_all_own" on cycles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- El ciclo activo vive en profiles (no una casilla por ciclo): con un solo
-- campo apuntando al ciclo activo, tener dos ciclos "actuales" a la vez
-- queda descartado por construcción.
alter table profiles
  add column active_cycle_id uuid references cycles (id) on delete set null;

-- ============================================================
-- brands
-- ============================================================

create table brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  margin_pct numeric(5, 2) not null default 0 check (margin_pct >= 0 and margin_pct <= 100),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table brands enable row level security;

create policy "brands_all_own" on brands
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- customers
-- ============================================================

create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  phone text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table customers enable row level security;

create policy "customers_all_own" on customers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- orders
-- ============================================================

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cycle_id uuid not null references cycles (id),
  customer_id uuid not null references customers (id),
  date date not null default current_date,
  delivery_status text not null default 'pending_receipt' check (
    delivery_status in (
      'pending_receipt',
      'received',
      'pending_delivery',
      'delivered',
      'cancelled'
    )
  ),
  notes text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "orders_all_own" on orders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- order_items
-- ============================================================

create table order_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null references orders (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  brand_id uuid references brands (id),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  unit_cost numeric(14, 2) check (unit_cost >= 0),
  position integer not null default 0
);

alter table order_items enable row level security;

create policy "order_items_all_own" on order_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- payments
-- ============================================================

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null references orders (id) on delete cascade,
  date date not null default current_date,
  amount numeric(14, 2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

alter table payments enable row level security;

create policy "payments_all_own" on payments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- expenses
-- ============================================================

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cycle_id uuid not null references cycles (id),
  category text not null check (
    category in ('shipping', 'packaging', 'advertising', 'commission', 'other')
  ),
  description text,
  amount numeric(14, 2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "expenses_all_own" on expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
