-- Create tables for Solana validator dashboard

-- Create RPC cache table
CREATE TABLE IF NOT EXISTS rpc_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create validators table
CREATE TABLE IF NOT EXISTS validators (
  pubkey TEXT PRIMARY KEY,
  name TEXT,
  commission INTEGER NOT NULL,
  activated_stake BIGINT NOT NULL,
  last_vote BIGINT,
  delinquent BOOLEAN DEFAULT false,
  performance_score NUMERIC,
  risk_score NUMERIC,
  apy NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create validator_history table
CREATE TABLE IF NOT EXISTS validator_history (
  id SERIAL PRIMARY KEY,
  validator_pubkey TEXT NOT NULL REFERENCES validators(pubkey),
  epoch INTEGER NOT NULL,
  commission INTEGER NOT NULL,
  activated_stake BIGINT NOT NULL,
  delinquent BOOLEAN DEFAULT false,
  uptime NUMERIC,
  skip_rate NUMERIC,
  performance_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(validator_pubkey, epoch)
);

-- Create rewards_history table
CREATE TABLE IF NOT EXISTS rewards_history (
  id SERIAL PRIMARY KEY,
  epoch INTEGER NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  avg_apy NUMERIC NOT NULL,
  min_apy NUMERIC,
  max_apy NUMERIC,
  avg_reward NUMERIC,
  total_rewards NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  slot BIGINT PRIMARY KEY,
  block_time TIMESTAMP WITH TIME ZONE,
  block_height BIGINT,
  leader TEXT,
  transactions INTEGER,
  fees BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  signature TEXT PRIMARY KEY,
  block_time TIMESTAMP WITH TIME ZONE,
  slot BIGINT,
  fee BIGINT,
  status TEXT,
  instruction_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stake distribution table
CREATE TABLE IF NOT EXISTS stake_distribution (
  id SERIAL PRIMARY KEY,
  distribution JSONB NOT NULL,
  total_stake BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_validators_delinquent ON validators(delinquent);
CREATE INDEX IF NOT EXISTS idx_validators_performance_score ON validators(performance_score);
CREATE INDEX IF NOT EXISTS idx_validators_risk_score ON validators(risk_score);
CREATE INDEX IF NOT EXISTS idx_validators_apy ON validators(apy);
CREATE INDEX IF NOT EXISTS idx_validator_history_validator_pubkey ON validator_history(validator_pubkey);
CREATE INDEX IF NOT EXISTS idx_validator_history_epoch ON validator_history(epoch);
CREATE INDEX IF NOT EXISTS idx_blocks_block_time ON blocks(block_time);
CREATE INDEX IF NOT EXISTS idx_transactions_block_time ON transactions(block_time);
CREATE INDEX IF NOT EXISTS idx_transactions_slot ON transactions(slot);
