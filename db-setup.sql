-- Create validators table
CREATE TABLE IF NOT EXISTS validators (
  vote_pubkey TEXT PRIMARY KEY,
  identity_pubkey TEXT NOT NULL,
  commission INTEGER NOT NULL,
  activated_stake BIGINT NOT NULL,
  last_vote BIGINT,
  delinquent BOOLEAN DEFAULT FALSE,
  name TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create validator_metrics table for time-series data
CREATE TABLE IF NOT EXISTS validator_metrics (
  id SERIAL PRIMARY KEY,
  vote_pubkey TEXT REFERENCES validators(vote_pubkey),
  epoch INTEGER NOT NULL,
  slot BIGINT NOT NULL,
  activated_stake BIGINT NOT NULL,
  credits INTEGER,
  rewards BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vote_pubkey, epoch)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  vote_pubkey TEXT REFERENCES validators(vote_pubkey),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, vote_pubkey)
);

-- Create validator_predictions table
CREATE TABLE IF NOT EXISTS validator_predictions (
  id SERIAL PRIMARY KEY,
  vote_pubkey TEXT REFERENCES validators(vote_pubkey),
  predicted_rewards BIGINT,
  predicted_uptime FLOAT,
  risk_score FLOAT,
  confidence FLOAT,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_validator_metrics_vote_pubkey ON validator_metrics(vote_pubkey);
CREATE INDEX IF NOT EXISTS idx_validator_metrics_epoch ON validator_metrics(epoch);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
