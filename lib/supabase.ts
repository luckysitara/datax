import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

// Create a single supabase client for the entire server session
export const createServerSupabaseClient = cache(() => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          "x-vercel-deployment": process.env.VERCEL_URL || "local",
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return createMockClient()
  }
})

// Create a client-side supabase client (for browser usage)
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export function createClientSupabaseClient() {
  if (clientSupabaseClient) return clientSupabaseClient

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    clientSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    return clientSupabaseClient
  } catch (error) {
    console.error("Error creating client Supabase client:", error)
    return createMockClient()
  }
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
  epoch: number
  time: string
  avg_apy: number
  min_apy?: number
  max_apy?: number
  avg_reward?: number
  total_rewards?: number
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

export type StakeDistribution = {
  id?: number
  distribution: any[]
  total_stake: number
  created_at?: string
}

export type Block = {
  id?: number
  slot: number
  block_time?: string
  block_height?: number
  leader?: string
  transactions?: number
  fees?: number
  created_at?: string
}

export type Transaction = {
  id?: number
  signature: string
  block_time?: string
  slot?: number
  fee?: number
  status?: string
  instruction_type?: string
  created_at?: string
}
