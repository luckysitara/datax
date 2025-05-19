"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function getTopValidators(limit = 5) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("validators")
      .select("*")
      .order("activated_stake", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching top validators:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getTopValidators:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getValidatorById(pubkey: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("validators").select("*").eq("pubkey", pubkey).single()

    if (error) {
      console.error(`Error fetching validator ${pubkey}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getValidatorById:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getValidatorHistory(pubkey: string, limit = 10) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("validator_history")
      .select("*")
      .eq("validator_pubkey", pubkey)
      .order("epoch", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`Error fetching history for validator ${pubkey}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getValidatorHistory:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getValidatorRewards(pubkey: string, limit = 10) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("rewards_history")
      .select("*")
      .eq("validator_pubkey", pubkey)
      .order("epoch", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`Error fetching rewards for validator ${pubkey}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getValidatorRewards:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getValidatorRisk(pubkey: string, limit = 10) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("risk_assessments")
      .select("*")
      .eq("validator_pubkey", pubkey)
      .order("epoch", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`Error fetching risk data for validator ${pubkey}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getValidatorRisk:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getValidatorPredictions(pubkey: string, limit = 5) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("model_predictions")
      .select("*")
      .eq("validator_pubkey", pubkey)
      .order("epoch", { ascending: true })
      .limit(limit)

    if (error) {
      console.error(`Error fetching predictions for validator ${pubkey}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getValidatorPredictions:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getAllValidators(limit = 100, offset = 0) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error, count } = await supabase
      .from("validators")
      .select("*", { count: "exact" })
      .order("activated_stake", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching validators:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data, count }
  } catch (error) {
    console.error("Error in getAllValidators:", error)
    return { success: false, error: (error as Error).message }
  }
}
