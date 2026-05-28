-- Supabase SQL Database Schema
-- Run this script in your Supabase SQL Editor to initialize the database tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Customer Profiles)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Users
alter table public.users enable row level security;

-- Create policies for Users
create policy "Allow public read access to users profiles" on public.users 
  for select using (true);

create policy "Allow individuals to update their own profile" on public.users 
  for update using (auth.uid() = id);

-- 2. Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  price decimal(10, 2) not null,
  discount decimal(5, 2) default 0.00,
  category text not null,
  brand text not null,
  stock integer not null default 0,
  images text[] not null default '{}',
  sku text unique not null,
  featured boolean default false,
  status text not null default 'active' check (status in ('active', 'draft')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Products
alter table public.products enable row level security;

-- Create policies for Products
create policy "Allow public read access to active products" on public.products 
  for select using (status = 'active' or (auth.jwt() ->> 'email' in (select email from public.users where role = 'admin')));

create policy "Allow admin write access to products" on public.products 
  for all using (
    exists (
      select 1 from public.users 
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- 3. Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete set null,
  products jsonb not null, -- [{ id, name, price, quantity, image }]
  amount decimal(10, 2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text not null, -- 'UPI', 'Card', 'Net Banking', 'Wallet', 'COD'
  order_status text not null default 'Pending' check (order_status in ('Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled')),
  shipping_address jsonb not null, -- { name, phone, address, city, state, pincode }
  return_status text default null check (return_status in (null, 'Requested', 'Approved', 'Rejected', 'Completed')),
  refund_status text default null check (refund_status in (null, 'Requested', 'Approved', 'Processed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Orders
alter table public.orders enable row level security;

-- Create policies for Orders
create policy "Allow individuals to view their own orders" on public.orders 
  for select using (auth.uid() = user_id or exists (
    select 1 from public.users 
    where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Allow individuals to create orders" on public.orders 
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Allow admin and owners to update orders" on public.orders 
  for update using (auth.uid() = user_id or exists (
    select 1 from public.users 
    where users.id = auth.uid() and users.role = 'admin'
  ));

-- 4. Reviews Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Reviews
alter table public.reviews enable row level security;

-- Create policies for Reviews
create policy "Allow public read access to reviews" on public.reviews 
  for select using (true);

create policy "Allow authenticated users to create reviews" on public.reviews 
  for insert with check (auth.uid() = user_id);

create policy "Allow owners and admin to delete reviews" on public.reviews 
  for delete using (auth.uid() = user_id or exists (
    select 1 from public.users 
    where users.id = auth.uid() and users.role = 'admin'
  ));

-- 5. Wishlist Table
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  unique(user_id, product_id)
);

-- Enable RLS for Wishlist
alter table public.wishlist enable row level security;

-- Create policies for Wishlist
create policy "Allow individuals to manage their wishlist" on public.wishlist 
  for all using (auth.uid() = user_id);

-- 6. Coupons Table
create table public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  discount decimal(5, 2) not null, -- Percentage e.g., 10.00 for 10%
  expiry_date date not null
);

-- Enable RLS for Coupons
alter table public.coupons enable row level security;

-- Create policies for Coupons
create policy "Allow public read access to coupons" on public.coupons 
  for select using (true);

create policy "Allow admin write access to coupons" on public.coupons 
  for all using (
    exists (
      select 1 from public.users 
      where users.id = auth.uid() and users.role = 'admin'
    )
  );
