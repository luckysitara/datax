# datax
```markdown project="Solana Validator Dashboard" file="README.md"
...
```

2. Install dependencies:


```shellscript
git clone https://github.com/luckysitara/datax.git
cd datax
npm install --legacy-peer-deps
```

3. Set up environment variables:


Create a `.env.local` file in the root directory with the following variables:

```plaintext
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Solana
SOLANA_RPC_URL=your_solana_rpc_url

# App Config
PORT=3000
```

4. Set up the database:


Run the SQL setup script in your Supabase SQL editor:

```sql
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
```

5. Run the development server:


```shellscript
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Usage


### Dashboard

The main dashboard provides an overview of the Solana network and validator statistics:

- Network statistics (TPS, active validators, total stake)
- Top validators by performance
- Recent blocks and transactions
- Stake distribution visualization


### Validators

The validators page allows you to:

- Browse all validators with filtering and sorting options
- View detailed information about each validator
- Analyze performance metrics and risk factors
- Track historical performance and rewards


### Analytics

The analytics section provides:

- APY trends over time
- Stake distribution analysis
- Performance comparisons
- Risk assessment visualizations


### Data Collection

To populate the dashboard with data:

1. Use the "Fetch Validators" button to collect current validator data
2. Set up a cron job to regularly update the data:


```shellscript
# Example cron job to update data every hour
0 * * * * curl -X POST https://your-deployment-url.vercel.app/api/cron/collect-data
```

## API Endpoints

### Validators

- `GET /api/validators` - Get all validators with pagination and filtering
- `GET /api/validators/[id]` - Get details for a specific validator
- `GET /api/validators/[id]/history` - Get historical data for a validator
- `GET /api/validators/[id]/rewards` - Get rewards history for a validator
- `GET /api/validators/[id]/predictions` - Get performance predictions for a validator
- `GET /api/validators/[id]/risk` - Get risk assessment for a validator
- `POST /api/validators/fetch` - Trigger validator data collection
- `POST /api/validators/fetch-all` - Fetch all validator data (comprehensive)


### Analytics

- `GET /api/analytics/rewards` - Get network-wide reward statistics
- `GET /api/analytics/stake` - Get stake distribution data


### Network

- `GET /api/network-stats` - Get current network statistics
- `GET /api/blocks` - Get recent blocks
- `GET /api/transactions` - Get recent transactions


### Machine Learning

- `POST /api/ml/train` - Train prediction models
- `GET /api/model/predict/[id]` - Get predictions for a validator


## Project Structure

```plaintext
solana-validator-dashboard/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard page
│   ├── validators/         # Validators pages
│   ├── analytics/          # Analytics pages
│   └── ...
├── components/             # React components
│   ├── ui/                 # UI components (shadcn/ui)
│   ├── validator-table.tsx # Validator table component
│   └── ...
├── lib/                    # Utility libraries
│   ├── supabase.ts         # Supabase client
│   ├── solana-rpc.ts       # Solana RPC client
│   └── ...
├── utils/                  # Utility functions
├── public/                 # Static assets
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
└── ...
```

## Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add the required environment variables
3. Deploy


For other platforms, build the project with:

```shellscript
npm run dev
```

And start the production server with:

```shellscript
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Solana](https://solana.com/) - The blockchain platform
- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.io/) - The open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Charting library
