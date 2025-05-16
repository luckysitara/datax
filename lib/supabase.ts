import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a singleton instance for the browser
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const createServerSupabaseClient = () => {
  try {
    return createClient<Database>(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
    )
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    // Return a mock client that won't throw errors but will log them
    return createMockClient()
  }
}

export const getSupabase = () => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error("Error creating client Supabase instance:", error)
      supabaseInstance = createMockClient()
    }
  }
  return supabaseInstance
}

// Create a mock client for when the real client fails
function createMockClient() {
  const mockResponse = (data = null, error = null) => {
    return {
      data,
      error,
      count: data ? (Array.isArray(data) ? data.length : 1) : 0,
    }
  }

  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve(mockResponse(null)),
          limit: () => ({
            single: () => Promise.resolve(mockResponse(null)),
          }),
          order: () => ({
            limit: () => Promise.resolve(mockResponse([])),
          }),
        }),
        order: () => ({
          limit: () => Promise.resolve(mockResponse([])),
          range: () => Promise.resolve(mockResponse([])),
        }),
        range: () => Promise.resolve(mockResponse([])),
        limit: () => Promise.resolve(mockResponse([])),
        lt: () => ({
          order: () => ({
            limit: () => Promise.resolve(mockResponse([])),
          }),
        }),
      }),
      insert: () => Promise.resolve(mockResponse(null)),
      upsert: () => Promise.resolve(mockResponse(null)),
      update: () => ({
        eq: () => Promise.resolve(mockResponse(null)),
        match: () => Promise.resolve(mockResponse(null)),
      }),
      delete: () => ({
        eq: () => Promise.resolve(mockResponse(null)),
        match: () => Promise.resolve(mockResponse(null)),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  } as any
}

// Define database types
export type Validator = {
  id?: number
  pubkey: string
  name?: string
  commission: number
  activated_stake: number
  last_vote?: number
  delinquent: boolean
  performance_score?: number
  risk_score?: number
  apy?: number
  created_at?: string
  updated_at?: string
}

export type ValidatorHistory = {
  id?: number
  validator_pubkey: string
  epoch: number
  commission: number
  activated_stake: number
  delinquent: boolean
  uptime?: number
  skip_rate?: number
  performance_score?: number
  created_at?: string
}

export type RewardsHistory = {
  id?: number
  validator_pubkey: string
  epoch: number
  reward?: number
  apy?: number
  created_at?: string
}

export type RiskAssessment = {
  id?: number
  validator_pubkey: string
  epoch: number
  risk_score: number
  delinquency_risk?: number
  concentration_risk?: number
  uptime_risk?: number
  skip_rate_risk?: number
  commission_change_risk?: number
  created_at?: string
}

export type ModelPrediction = {
  id?: number
  validator_pubkey: string
  epoch: number
  predicted_apy?: number
  min_apy?: number
  max_apy?: number
  predicted_risk?: number
  confidence?: number
  created_at?: string
}

export type EpochInfo = {
  id?: number
  epoch: number
  slot?: number
  slots_in_epoch?: number
  absolute_slot?: number
  block_height?: number
  transaction_count?: number
  avg_reward?: number
  created_at?: string
}
