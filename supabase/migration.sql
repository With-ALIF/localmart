-- ============================================
-- Patgram Online Store - Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- 2. CATEGORIES
-- ============================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text default '',
  image text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table categories enable row level security;

create policy "Public read categories"
  on categories for select
  using (true);

create policy "Admin manage categories"
  on categories for all
  using (auth.uid() in (select id from profiles where email = 'admin@patgram.com'));

-- ============================================
-- 3. PRODUCTS
-- ============================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  details text default '',
  category text references categories(slug) on delete set null,
  price numeric(10,2) not null default 0,
  old_price numeric(10,2) default 0,
  rating numeric(2,1) default 0,
  reviews int default 0,
  stock int default 0,
  unit text default '',
  brand text default '',
  image text,
  tags text[] default '{}',
  sku text default '',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table products enable row level security;

create policy "Public read active products"
  on products for select
  using (is_active = true);

create policy "Admin manage products"
  on products for all
  using (auth.uid() in (select id from profiles where email = 'admin@patgram.com'));

-- ============================================
-- 4. ADDRESSES
-- ============================================
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  label text default 'বাসা',
  name text not null,
  phone text not null,
  address text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table addresses enable row level security;

create policy "Users can view own addresses"
  on addresses for select
  using (auth.uid() = user_id);

create policy "Users can insert own addresses"
  on addresses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own addresses"
  on addresses for update
  using (auth.uid() = user_id);

create policy "Users can delete own addresses"
  on addresses for delete
  using (auth.uid() = user_id);

-- ============================================
-- 5. ORDERS (online + POS unified)
-- ============================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references profiles(id) on delete set null,
  order_source text not null default 'online',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text,
  subtotal numeric(10,2) not null default 0,
  discount_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null default 0,
  paid_amount numeric(10,2) default 0,
  due_amount numeric(10,2) default 0,
  payment_method text default 'COD',
  payment_status text default 'pending',
  status text default 'pending',
  admin_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert orders"
  on orders for insert
  with check (true);

create policy "Admin full access orders"
  on orders for all
  using (auth.uid() in (select id from profiles where email = 'admin@patgram.com'));

-- ============================================
-- 6. ORDER ITEMS
-- ============================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null default 1,
  subtotal numeric(10,2) not null
);

alter table order_items enable row level security;

create policy "Read order items via parent"
  on order_items for select
  using (
    order_id in (
      select id from orders
      where user_id = auth.uid()
      or auth.uid() in (select id from profiles where email = 'admin@patgram.com')
    )
  );

create policy "Insert order items"
  on order_items for insert
  with check (true);

create policy "Admin manage order items"
  on order_items for all
  using (auth.uid() in (select id from profiles where email = 'admin@patgram.com'));

-- ============================================
-- 7. SETTINGS
-- ============================================
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table settings enable row level security;

create policy "Public read settings"
  on settings for select
  using (true);

create policy "Admin manage settings"
  on settings for all
  using (auth.uid() in (select id from profiles where email = 'admin@patgram.com'));

-- Insert default store settings
insert into settings (key, value) values (
  'store_settings',
  '{
    "storeName": "Patgram Online Store",
    "storeDescription": "নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়",
    "storePhone": "01611820567",
    "storeEmail": "rs2pgm@gmail.com",
    "storeAddress": "পাটগ্রাম, লালমনিরহাট-৫৫৪০",
    "currency": "BDT",
    "language": "bn",
    "freeShippingMin": 500,
    "shippingFee": 60,
    "deliveryNote": "ঢাকায় ২৪ ঘণ্টায় ডেলিভারি",
    "lowStockAlert": 10,
    "orderNotifications": true,
    "emailNotifications": true,
    "smsNotifications": false,
    "adminName": "Admin",
    "adminEmail": "admin@patgram.com"
  }'::jsonb
) on conflict (key) do nothing;

-- ============================================
-- 8. SEED DATA - Categories
-- ============================================
insert into categories (slug, name, icon, sort_order) values
  ('fruits', 'ফল', '🍎', 1),
  ('vegetables', 'সবজি', '🥬', 2),
  ('fish', 'মাছ', '🐟', 3),
  ('meat', 'মাংস', '🥩', 4),
  ('dairy', 'দুগ্ধ', '🥛', 5),
  ('bakery', 'বেকারি', '🍞', 6),
  ('beverages', 'পানীয়', '🥤', 7),
  ('snacks', 'নাস্তা', '🍪', 8)
on conflict (slug) do nothing;

-- ============================================
-- 9. SEED DATA - Admin user
-- Register admin@patgram.com with password admin123
-- via Supabase Dashboard > Auth > Users
-- ============================================

-- ============================================
-- 10. INDEXES
-- ============================================
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_order_number on orders(order_number);
create index if not exists idx_orders_order_source on orders(order_source);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_addresses_user_id on addresses(user_id);
create index if not exists idx_settings_key on settings(key);
