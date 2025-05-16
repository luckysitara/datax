import { NextResponse } from "next/server"
import * as tf from "@tensorflow/tfjs-node"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const validatorId = params.id
    const supabase = createServerSupabaseClient()

    // Get validator details
    const { data: validator, error } = await supabase.from("validators").select("*").eq("pubkey", validatorId).single()

    if (error) {
      throw error
    }

    // Get historical data for this validator
    const { data: history, error: historyError } = await supabase
      .from("validator_history")
      .select("*")
      .eq("validator_pubkey", validatorId)
      .order("epoch", { ascending: false })
      .limit(10)

    if (historyError) {
      throw historyError
    }

    // Get rewards history for this validator
    const { data: rewards, error: rewardsError } = await supabase
      .from("rewards_history")
      .select("*")
      .eq("validator_pubkey", validatorId)
      .order("epoch", { ascending: false })
      .limit(10)

    if (rewardsError) {
      throw rewardsError
    }

    // Check if we have enough data for prediction
    if (!history || history.length < 3 || !rewards || rewards.length < 3) {
      return NextResponse.json({
        success: false,
        message: "Not enough historical data for prediction",
      })
    }

    // Create a simple model
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 64, activation: "relu", inputShape: [4] }))
    model.add(tf.layers.dense({ units: 32, activation: "relu" }))
    model.add(tf.layers.dense({ units: 1 }))

    // Compile the model
    model.compile({ optimizer: "adam", loss: "meanSquaredError" })

    // Prepare input data
    const input = tf.tensor2d([
      [
        validator.commission || 0,
        (validator.activated_stake || 0) / 1_000_000_000, // Normalize stake to SOL
        validator.delinquent ? 1 : 0,
        validator.performance_score || 50, // Default to 50 if null
      ],
    ])

    // Get current epoch
    const { data: epochInfo, error: epochError } = await supabase
      .from("epoch_info")
      .select("epoch")
      .order("epoch", { ascending: false })
      .limit(1)
      .single()

    if (epochError) {
      throw epochError
    }

    const currentEpoch = epochInfo.epoch
    const nextEpoch = currentEpoch + 1

    // Since we don't have a trained model, we'll use a simple heuristic
    // based on the validator's current APY and recent history
    let predictedAPY = validator.apy || 0

    // Adjust based on recent trend
    if (rewards.length >= 2 && rewards[0].apy !== null && rewards[1].apy !== null) {
      const recentTrend = rewards[0].apy - rewards[1].apy
      predictedAPY += recentTrend * 0.5 // Apply half of the recent trend
    }

    // Add some variance for min/max
    const minAPY = Math.max(0, predictedAPY * 0.95)
    const maxAPY = predictedAPY * 1.05

    // Calculate confidence based on data availability
    const confidence = Math.min(0.7, 0.5 + rewards.length / 20)

    // Store prediction in database
    await supabase.from("model_predictions").upsert(
      {
        validator_pubkey: validator.pubkey,
        epoch: nextEpoch,
        predicted_apy: predictedAPY,
        min_apy: minAPY,
        max_apy: maxAPY,
        predicted_risk: validator.risk_score, // Use current risk score as prediction
        confidence,
      },
      { onConflict: "validator_pubkey, epoch" },
    )

    return NextResponse.json({
      success: true,
      data: {
        validator_pubkey: validator.pubkey,
        epoch: nextEpoch,
        predicted_apy: predictedAPY,
        min_apy: minAPY,
        max_apy: maxAPY,
        predicted_risk: validator.risk_score,
        confidence,
      },
    })
  } catch (error) {
    console.error("Error making prediction:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to make prediction",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
