export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      validators: {
        Row: {
          id: number
          pubkey: string
          name: string | null
          commission: number
          activated_stake: number
          last_vote: number | null
          delinquent: boolean
          performance_score: number | null
          risk_score: number | null
          apy: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          pubkey: string
          name?: string | null
          commission: number
          activated_stake: number
          last_vote?: number | null
          delinquent?: boolean
          performance_score?: number | null
          risk_score?: number | null
          apy?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          pubkey?: string
          name?: string | null
          commission?: number
          activated_stake?: number
          last_vote?: number | null
          delinquent?: boolean
          performance_score?: number | null
          risk_score?: number | null
          apy?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      validator_history: {
        Row: {
          id: number
          validator_pubkey: string
          epoch: number
          commission: number
          activated_stake: number
          delinquent: boolean
          uptime: number | null
          skip_rate: number | null
          performance_score: number | null
          created_at: string
        }
        Insert: {
          id?: number
          validator_pubkey: string
          epoch: number
          commission: number
          activated_stake: number
          delinquent?: boolean
          uptime?: number | null
          skip_rate?: number | null
          performance_score?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          validator_pubkey?: string
          epoch?: number
          commission?: number
          activated_stake?: number
          delinquent?: boolean
          uptime?: number | null
          skip_rate?: number | null
          performance_score?: number | null
          created_at?: string
        }
      }
      rewards_history: {
        Row: {
          id: number
          validator_pubkey: string
          epoch: number
          reward: number | null
          apy: number | null
          created_at: string
        }
        Insert: {
          id?: number
          validator_pubkey: string
          epoch: number
          reward?: number | null
          apy?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          validator_pubkey?: string
          epoch?: number
          reward?: number | null
          apy?: number | null
          created_at?: string
        }
      }
      risk_assessments: {
        Row: {
          id: number
          validator_pubkey: string
          epoch: number
          risk_score: number
          delinquency_risk: number | null
          concentration_risk: number | null
          uptime_risk: number | null
          skip_rate_risk: number | null
          commission_change_risk: number | null
          created_at: string
        }
        Insert: {
          id?: number
          validator_pubkey: string
          epoch: number
          risk_score: number
          delinquency_risk?: number | null
          concentration_risk?: number | null
          uptime_risk?: number | null
          skip_rate_risk?: number | null
          commission_change_risk?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          validator_pubkey?: string
          epoch?: number
          risk_score?: number
          delinquency_risk?: number | null
          concentration_risk?: number | null
          uptime_risk?: number | null
          skip_rate_risk?: number | null
          commission_change_risk?: number | null
          created_at?: string
        }
      }
      model_predictions: {
        Row: {
          id: number
          validator_pubkey: string
          epoch: number
          predicted_apy: number | null
          min_apy: number | null
          max_apy: number | null
          predicted_risk: number | null
          confidence: number | null
          created_at: string
        }
        Insert: {
          id?: number
          validator_pubkey: string
          epoch: number
          predicted_apy?: number | null
          min_apy?: number | null
          max_apy?: number | null
          predicted_risk?: number | null
          confidence?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          validator_pubkey?: string
          epoch?: number
          predicted_apy?: number | null
          min_apy?: number | null
          max_apy?: number | null
          predicted_risk?: number | null
          confidence?: number | null
          created_at?: string
        }
      }
      epoch_info: {
        Row: {
          id: number
          epoch: number
          slot: number | null
          slots_in_epoch: number | null
          absolute_slot: number | null
          block_height: number | null
          transaction_count: number | null
          avg_reward: number | null
          created_at: string
        }
        Insert: {
          id?: number
          epoch: number
          slot?: number | null
          slots_in_epoch?: number | null
          absolute_slot?: number | null
          block_height?: number | null
          transaction_count?: number | null
          avg_reward?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          epoch?: number
          slot?: number | null
          slots_in_epoch?: number | null
          absolute_slot?: number | null
          block_height?: number | null
          transaction_count?: number | null
          avg_reward?: number | null
          created_at?: string
        }
      }
    }
  }
}
