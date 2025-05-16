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

    // Try to get validator predictions from database
    const supabase = createServerSupabaseClient()
    let predictions = []
    let dbError = null

    try {
      const { data, error } = await supabase
        .from("model_predictions")
        .select("*")
        .eq("validator_pubkey", validatorId)
        .order("epoch", { ascending: true })
        .limit(5)

      if (error) {
        throw error
      }

      predictions = data || []
    } catch (error) {
      console.error(`Error fetching predictions for validator ${validatorId}:`, error)
      dbError = error
    }

    // If we have predictions from the database, return them
    if (predictions.length > 0) {
      return NextResponse.json({
        success: true,
        data: predictions,
        source: "database",
      })
    }

    // If database failed or returned no predictions, generate realistic data
    console.log(`Generating realistic predictions for validator ${validatorId}`)

    // Get validator to determine current APY
    let baseApy = 6.5 // Default APY
    try {
      const { data: validator } = await supabase.from("validators").select("apy").eq("pubkey", validatorId).single()

      if (validator && validator.apy) {
        baseApy = validator.apy
      }
    } catch (error) {
      console.error(`Error fetching validator ${validatorId} for APY:`, error)
    }

    const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))

    const generatedPredictions = Array.from({ length: 5 }, (_, i) => {
      const epoch = currentEpoch + i + 1
      const predicted_apy = baseApy + i * 0.1
      const min_apy = predicted_apy * 0.95
      const max_apy = predicted_apy * 1.05
      const predicted_risk = Math.floor(Math.random() * 30) + 10

      return {
        validator_pubkey: validatorId,
        epoch,
        predicted_apy,
        min_apy,
        max_apy,
        predicted_risk,
        confidence: 0.8,
        created_at: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: generatedPredictions,
      source: "generated",
      dbError: dbError ? (dbError as Error).message : null,
    })
  } catch (error) {
    console.error("Error fetching validator predictions:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validator predictions",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
