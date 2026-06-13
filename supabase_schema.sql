-- ====================================================================
-- LUMORA INVESTMENT PLATFORM - POSTGRESQL DDL SCHEMA
-- Target Backend: Supabase PostgreSQL with Row Level Security (RLS)
-- File: supabase_schema.sql
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS (Extends Supabase Auth users, or manages custom auth)
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    full_name varchar(255) not null,
    phone varchar(50) unique not null,
    password_hash text not null,
    is_admin boolean default false,
    status varchar(50) default 'active' check (status in ('active', 'suspended')),
    registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
    referral_code varchar(50) unique not null,
    referred_by varchar(50) references public.users(referral_code)
);

-- 2. PROFILES
create table public.profiles (
    user_id uuid primary key references public.users(id) on delete cascade,
    full_name varchar(255) not null,
    phone varchar(50) not null,
    profile_picture text,
    vip_level integer default 0,
    wallet_balance numeric(15, 2) default 0.00 check (wallet_balance >= 0),
    total_deposits numeric(15, 2) default 0.00,
    total_withdrawals numeric(15, 2) default 0.00,
    total_investments numeric(15, 2) default 0.00,
    total_earnings numeric(15, 2) default 0.00,
    referral_code varchar(50) not null,
    team_size integer default 0,
    registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
    transaction_pin varchar(4) check (transaction_pin ~ '^[0-7]{4}$' or transaction_pin is null)
);

-- 3. WALLETS (Explicit table to isolate live balances)
create table public.wallets (
    user_id uuid primary key references public.users(id) on delete cascade,
    balance numeric(15, 2) default 0.00 check (balance >= 0),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INVESTMENT PLANS (The 15 VIP configurations)
create table public.investment_plans (
    id uuid primary key default uuid_generate_v4(),
    level integer unique not null,
    name varchar(100) not null,
    required_investment numeric(15, 2) not null,
    daily_rate numeric(5, 4) not null, -- e.g. 0.0120 for 1.2%
    duration_days integer not null,
    estimated_return numeric(15, 2) not null,
    is_active boolean default true
);

-- 5. INVESTMENTS (Active user purchases)
create table public.investments (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    plan_id uuid not null references public.investment_plans(id),
    plan_name varchar(100) not null,
    plan_level integer not null,
    amount numeric(15, 2) not null check (amount > 0),
    daily_rate numeric(5, 4) not null,
    daily_return numeric(15, 2) not null,
    start_date timestamp with time zone default timezone('utc'::text, now()) not null,
    maturity_date timestamp with time zone not null,
    remaining_days integer not null,
    status varchar(50) default 'active' check (status in ('active', 'matured')),
    total_earned numeric(15, 2) default 0.00
);

-- 6. DAILY EARNINGS (Daily credited logs)
create table public.daily_earnings (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    investment_id uuid not null references public.investments(id) on delete cascade,
    plan_name varchar(100) not null,
    amount numeric(15, 2) not null,
    date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. DEPOSITS
create table public.deposits (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    user_name varchar(255) not null,
    user_phone varchar(50) not null,
    amount numeric(15, 2) not null check (amount > 0),
    bank_account varchar(255) default 'Commercial Bank of Ethiopia (CBE)',
    receipt_image text not null, -- URL to base64 or Supabase Storage bucket
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status varchar(50) default 'pending' check (status in ('pending', 'approved', 'rejected')),
    rejection_reason text,
    reviewed_at timestamp with time zone
);

-- 8. WITHDRAWALS
create table public.withdrawals (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    user_name varchar(255) not null,
    user_phone varchar(50) not null,
    amount numeric(15, 2) not null check (amount > 0),
    status varchar(50) default 'pending' check (status in ('pending', 'approved', 'rejected')),
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    reviewed_at timestamp with time zone,
    rejection_reason text
);

-- 9. TRANSACTIONS (Financial audit ledger)
create table public.transactions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    type varchar(50) not null check (type in ('deposit', 'withdrawal', 'investment', 'daily_earnings', 'referral_reward')),
    amount numeric(15, 2) not null,
    description text not null,
    date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. NOTIFICATIONS
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    title varchar(255) not null,
    message text not null,
    read boolean default false,
    date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. REFERRALS (Tracking network trees)
create table public.referrals (
    id uuid primary key default uuid_generate_v4(),
    referrer_id uuid not null references public.users(id),
    referred_id uuid unique not null references public.users(id),
    referred_name varchar(255) not null,
    referred_phone varchar(50) not null,
    referred_vip_level integer default 0,
    registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
    reward_earned numeric(15, 2) default 0.00
);

-- 12. CHAT HISTORY (Gemini context)
create table public.chat_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    sender varchar(50) not null check (sender in ('user', 'assistant')),
    text text not null,
    date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. AGREEMENTS
create table public.agreements (
    id uuid primary key default uuid_generate_v4(),
    title varchar(255) not null,
    category varchar(50) not null check (category in ('terms', 'policies', 'agreements', 'compliance')),
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
    content text not null
);

-- 14. SETTINGS
create table public.settings (
    id uuid primary key default uuid_generate_v4(),
    cbe_account_name varchar(255) not null default 'LUMORA Financial Group',
    cbe_account_number varchar(255) not null default '1000456123985',
    referral_bonus_percentage numeric(5, 2) default 10.00
);

-- 15. ADMIN LOGS
create table public.admin_logs (
    id uuid primary key default uuid_generate_v4(),
    admin_id uuid not null references public.users(id),
    action varchar(255) not null,
    details text not null,
    date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. LOGIN HISTORY
create table public.login_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    phone varchar(50) not null,
    device varchar(255) not null,
    ip varchar(50) not null,
    date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. DEVICE SESSIONS
create table public.device_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    device_id varchar(255) not null,
    last_active timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.investments enable row level security;
alter table public.daily_earnings enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.referrals enable row level security;
alter table public.chat_history enable row level security;

-- USERS POLICIES
create policy "Users can read own record" on public.users 
    for select using (auth.uid() = id);

-- PROFILES POLICIES
create policy "Users can read/write own profile" on public.profiles 
    for all using (auth.uid() = user_id);

-- WALLETS POLICIES
create policy "Users can view own wallet" on public.wallets 
    for select using (auth.uid() = user_id);

-- INVESTMENTS POLICIES
create policy "Users can view own investments" on public.investments 
    for select using (auth.uid() = user_id);
create policy "Users can purchase investment" on public.investments 
    for insert with check (auth.uid() = user_id);

-- DEPOSITS POLICIES
create policy "Users can view own deposits" on public.deposits 
    for select using (auth.uid() = user_id);
create policy "Users can request deposit" on public.deposits 
    for insert with check (auth.uid() = user_id);

-- WITHDRAWALS POLICIES
create policy "Users can view own withdrawals" on public.withdrawals 
    for select using (auth.uid() = user_id);
create policy "Users can request withdrawal" on public.withdrawals 
    for insert with check (auth.uid() = user_id);

-- TRANSACTIONS POLICIES
create policy "Users can view own transactions" on public.transactions 
    for select using (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
create policy "Users can view own notifications" on public.notifications 
    for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications 
    for update using (auth.uid() = user_id);


-- ====================================================================
-- SEED INITIAL DATA (The 15 VIP plans and standard settings)
-- ====================================================================

insert into public.investment_plans (name, level, required_investment, daily_rate, duration_days, estimated_return) values
('VIP Level 1', 1, 5000, 0.0120, 30, 6800),
('VIP Level 2', 2, 10000, 0.0140, 30, 14200),
('VIP Level 3', 3, 25000, 0.0160, 35, 39000),
('VIP Level 4', 4, 50000, 0.0180, 35, 81500),
('VIP Level 5', 5, 100000, 0.0200, 40, 180000),
('VIP Level 6', 6, 250000, 0.0220, 40, 470000),
('VIP Level 7', 7, 500000, 0.0240, 45, 1040000),
('VIP Level 8', 8, 1000000, 0.0260, 45, 2170000),
('VIP Level 9', 9, 2000000, 0.0280, 50, 4800000),
('VIP Level 10', 10, 5000000, 0.0300, 50, 12500000),
('VIP Level 11', 11, 10000000, 0.0320, 60, 29200000),
('VIP Level 12', 12, 25000000, 0.0340, 60, 76000000),
('VIP Level 13', 13, 50000000, 0.0360, 90, 212000000),
('VIP Level 14', 14, 75000000, 0.0380, 90, 331250000),
('VIP Level 15', 15, 100000000, 0.0400, 120, 580000000)
on conflict (level) do update set 
    required_investment = excluded.required_investment,
    daily_rate = excluded.daily_rate,
    duration_days = excluded.duration_days,
    estimated_return = excluded.estimated_return;

insert into public.settings (cbe_account_name, cbe_account_number, referral_bonus_percentage) 
values ('LUMORA Financial Group', '1000456123985', 10.00);
