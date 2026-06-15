-- Initial schema for NESUBS

CREATE TABLE IF NOT EXISTS kv_store_f9b2f90e (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  data JSONB
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  product_id TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  transaction_ref TEXT UNIQUE,
  qr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS payment_gateway_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  provider TEXT,
  merchant_id TEXT,
  api_key TEXT,
  api_secret TEXT,
  environment TEXT DEFAULT 'sandbox',
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
