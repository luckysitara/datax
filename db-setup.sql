-- Create function to set up all database tables
CREATE OR REPLACE FUNCTION setup_database_tables()
RETURNS void AS $$
BEGIN
    -- Create validators table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validators') THEN
        CREATE TABLE validators (
            vote_pubkey TEXT PRIMARY KEY,
            identity_pubkey TEXT NOT NULL,
            name TEXT,
            website TEXT,
            commission INTEGER NOT NULL,
            activated_stake BIGINT NOT NULL,
            last_vote BIGINT,
            delinquent BOOLEAN NOT NULL DEFAULT FALSE,
            performance_score FLOAT,
            risk_score FLOAT,
            apy FLOAT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create validator_history table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_history') THEN
        CREATE TABLE validator_history (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL REFERENCES validators(vote_pubkey),
            epoch INTEGER NOT NULL,
            slot BIGINT NOT NULL,
            activated_stake BIGINT NOT NULL,
            credits INTEGER,
            rewards BIGINT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(vote_pubkey, epoch)
        );
    END IF;

    -- Create validator_rewards table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_rewards') THEN
        CREATE TABLE validator_rewards (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL REFERENCES validators(vote_pubkey),
            epoch INTEGER NOT NULL,
            amount BIGINT NOT NULL,
            post_balance BIGINT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(vote_pubkey, epoch)
        );
    END IF;

    -- Create validator_risk table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_risk') THEN
        CREATE TABLE validator_risk (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL REFERENCES validators(vote_pubkey),
            risk_score FLOAT NOT NULL,
            risk_factors JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(vote_pubkey)
        );
    END IF;

    -- Create blocks table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blocks') THEN
        CREATE TABLE blocks (
            slot BIGINT PRIMARY KEY,
            block_time TIMESTAMP WITH TIME ZONE,
            block_height BIGINT,
            leader TEXT,
            transactions INTEGER,
            fees FLOAT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create transactions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
        CREATE TABLE transactions (
            signature TEXT PRIMARY KEY,
            block_time TIMESTAMP WITH TIME ZONE,
            slot BIGINT,
            fee FLOAT,
            status TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create validator_predictions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_predictions') THEN
        CREATE TABLE validator_predictions (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL REFERENCES validators(vote_pubkey),
            predicted_performance FLOAT,
            predicted_apy FLOAT,
            confidence FLOAT,
            model_version TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create network_stats table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'network_stats') THEN
        CREATE TABLE network_stats (
            id SERIAL PRIMARY KEY,
            current_slot BIGINT,
            current_epoch INTEGER,
            total_stake BIGINT,
            active_validators INTEGER,
            delinquent_validators INTEGER,
            average_apy FLOAT,
            tps FLOAT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to create RPC cache table
CREATE OR REPLACE FUNCTION create_rpc_cache_table()
RETURNS void AS $$
BEGIN
    -- Create rpc_cache table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rpc_cache') THEN
        CREATE TABLE rpc_cache (
            cache_key TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index on created_at for cache cleanup
        CREATE INDEX rpc_cache_created_at_idx ON rpc_cache(created_at);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to create validator info cache table
CREATE OR REPLACE FUNCTION create_validator_info_cache_table()
RETURNS void AS $$
BEGIN
    -- Create validator_info_cache table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_info_cache') THEN
        CREATE TABLE validator_info_cache (
            pubkey TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index on updated_at for cache cleanup
        CREATE INDEX validator_info_cache_updated_at_idx ON validator_info_cache(updated_at);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create functions for individual table creation
CREATE OR REPLACE FUNCTION create_validators_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validators') THEN
        CREATE TABLE validators (
            vote_pubkey TEXT PRIMARY KEY,
            identity_pubkey TEXT NOT NULL,
            name TEXT,
            website TEXT,
            commission INTEGER NOT NULL,
            activated_stake BIGINT NOT NULL,
            last_vote BIGINT,
            delinquent BOOLEAN NOT NULL DEFAULT FALSE,
            performance_score FLOAT,
            risk_score FLOAT,
            apy FLOAT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_validator_history_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_history') THEN
        CREATE TABLE validator_history (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL,
            epoch INTEGER NOT NULL,
            slot BIGINT NOT NULL,
            activated_stake BIGINT NOT NULL,
            credits INTEGER,
            rewards BIGINT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(vote_pubkey, epoch)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_rewards_history_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_rewards') THEN
        CREATE TABLE validator_rewards (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL,
            epoch INTEGER NOT NULL,
            amount BIGINT NOT NULL,
            post_balance BIGINT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(vote_pubkey, epoch)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_risk_assessment_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validator_risk') THEN
        CREATE TABLE validator_risk (
            id SERIAL PRIMARY KEY,
            vote_pubkey TEXT NOT NULL,
            risk_score FLOAT NOT NULL,
            risk_factors JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(vote_pubkey)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the setup function
SELECT setup_database_tables();
