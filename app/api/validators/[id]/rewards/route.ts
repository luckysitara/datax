import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const validatorId = params.id

    if (!validatorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Validator ID is required",
        },
        { status: 400 },
      )
    }

    // Try to get validator rewards from database
    const supabase = createServerSupabaseClient()
    let rewards = []
    let dbError = null

    try {
      const { data, error } = await supabase
        .from("rewards_history")
        .select("*")
        .eq("validator_pubkey", validatorId)
        .order("epoch", { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      rewards = data || []
    } catch (error) {
      console.error(`Error fetching rewards for validator ${validatorId}:`, error)
      dbError = error
    }

    // If we have rewards from the database, return them
    if (rewards.length > 0) {
      return NextResponse.json({
        success: true,
        data: rewards,
        source: "database",
      })
    }

    // If database failed or returned no rewards, generate realistic data
    console.log(`Generating realistic rewards for validator ${validatorId}`)

    // Get validator to determine commission
    let commission = 5 // Default commission
    try {
      const { data: validator } = await supabase
        .from("validators")
        .select("commission")
        .eq("pubkey", validatorId)
        .single()

      if (validator) {
        commission = validator.commission
      }
    } catch (error) {
      console.error(`Error fetching validator ${validatorId} for commission:`, error)
    }

    const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
    const baseApy = 6.5 - (commission / 100) * 6.5

    const generatedRewards = Array.from({ length: 10 }, (_, i) => {
      const epoch = currentEpoch - i
      const apy = baseApy - i * 0.05 + (Math.random() * 0.2 - 0.1)
      const reward = Math.floor(Math.random() * 1000) + 500

      return {
        validator_pubkey: validatorId,
        epoch,
        reward,
        apy,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: generatedRewards,
      source: "generated",
      dbError: dbError ? (dbError as Error).message : null,
    })
  } catch (error) {
    console.error("Error fetching validator rewards:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validator rewards",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
