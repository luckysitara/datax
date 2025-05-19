import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as tf from "@tensorflow/tfjs-node"

export async function POST() {
  try {
    console.log("Starting model training...")
    const supabase = createServerSupabaseClient()

    // Log training start
    const trainingStart = new Date().toISOString()
    const { data: trainingLog, error: logError } = await supabase
      .from("model_training_logs")
      .insert({
        model_type: "validator_performance",
        training_start: trainingStart,
        parameters: {
          epochs: 100,
          batchSize: 32,
          learningRate: 0.001,
        },
      })
      .select()
      .single()

    if (logError) {
      console.error("Error logging training start:", logError)
    }

    // Fetch training data from database
    const { data: validators, error: validatorsError } = await supabase.from("validators").select("*")

    if (validatorsError) {
      throw validatorsError
    }

    // Fetch historical data for feature engineering
    const { data: validatorHistory, error: historyError } = await supabase
      .from("validator_history")
      .select("*")
      .order("time", { ascending: false })

    if (historyError) {
      throw historyError
    }

    // Fetch rewards history for target values
    const { data: rewardsHistory, error: rewardsError } = await supabase
      .from("rewards_history")
      .select("*")
      .order("time", { ascending: false })

    if (rewardsError) {
      throw rewardsError
    }

    // Prepare data for training
    const validValidators =
      validators?.filter((v) => v.commission !== null && v.activated_stake !== null && v.performance_score !== null) ||
      []

    if (validValidators.length < 10) {
      throw new Error("Not enough valid validators for training")
    }

    console.log(`Training model with ${validValidators.length} validators...`)

    // Prepare features and labels
    const features = validValidators.map((validator) => {
      // Get validator history
      const history = validatorHistory?.filter((h) => h.validator_pubkey === validator.pubkey) || []

      // Calculate historical metrics
      const avgPerformance =
        history.length > 0
          ? history.reduce((sum, h) => sum + (h.performance_score || 0), 0) / history.length
          : validator.performance_score || 50

      const performanceStability =
        history.length > 1 ? calculateStandardDeviation(history.map((h) => h.performance_score || 0)) : 5

      const delinquentRate =
        history.length > 0 ? history.filter((h) => h.delinquent).length / history.length : validator.delinquent ? 1 : 0

      // Return feature vector
      return [
        validator.commission / 100, // Normalize commission to 0-1
        Math.log(validator.activated_stake) / 30, // Normalize stake using log scale
        validator.delinquent ? 1 : 0,
        validator.performance_score / 100, // Normalize performance score to 0-1
        avgPerformance / 100, // Normalize average performance to 0-1
        performanceStability / 20, // Normalize stability
        delinquentRate, // Already 0-1
      ]
    })

    // Prepare labels (APY)
    const labels = validValidators.map((validator) => {
      // Get validator rewards
      const rewards = rewardsHistory?.filter((r) => r.validator_pubkey === validator.pubkey) || []

      // Use average APY as label
      return rewards.length > 0
        ? rewards.reduce((sum, r) => sum + (r.apy || 0), 0) / rewards.length / 10 // Normalize to 0-1
        : validator.apy / 10 // Normalize to 0-1
    })

    // Convert to tensors
    const xs = tf.tensor2d(features)
    const ys = tf.tensor2d(labels.map((l) => [l]))

    // Create model
    const model = tf.sequential()

    // Add layers
    model.add(
      tf.layers.dense({
        units: 32,
        activation: "relu",
        inputShape: [features[0].length],
      }),
    )

    model.add(
      tf.layers.dense({
        units: 16,
        activation: "relu",
      }),
    )

    model.add(
      tf.layers.dense({
        units: 1,
      }),
    )

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError",
      metrics: ["mse"],
    })

    // Train model
    const trainingHistory = await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}, val_loss = ${logs?.val_loss}`)
        },
      },
    })

    // Get current epoch
    const { data: epochInfo, error: epochError } = await supabase
      .from("epoch_info")
      .select("epoch")
      .order("epoch", { ascending: false })
      .limit(1)
      .single()

    if (epochError) {
      console.error("Error fetching current epoch:", epochError)
      throw epochError
    }

    const currentEpoch = epochInfo?.epoch || Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))

    // Generate predictions for future epochs
    const predictions = []

    for (let i = 0; i < validValidators.length; i++) {
      const validator = validValidators[i]
      const input = tf.tensor2d([features[i]])

      // Predict APY
      const prediction = model.predict(input) as tf.Tensor
      const predictedAPY = (await prediction.data())[0] * 10 // Denormalize

      // Calculate confidence based on validation loss
      const confidence = Math.max(
        0.5,
        1 - Math.sqrt(trainingHistory.history.val_loss[trainingHistory.history.val_loss.length - 1]),
      )

      // Add predictions for next 5 epochs
      for (let j = 1; j <= 5; j++) {
        const futureEpoch = currentEpoch + j

        // Add some variance for future epochs
        const epochVariance = j * 0.05
        const minAPY = predictedAPY * (1 - epochVariance)
        const maxAPY = predictedAPY * (1 + epochVariance)

        predictions.push({
          validator_pubkey: validator.pubkey,
          epoch: futureEpoch,
          predicted_apy: predictedAPY,
          min_apy: minAPY,
          max_apy: maxAPY,
          predicted_risk: validator.risk_score, // Use current risk score as prediction
          confidence: Math.max(0.5, confidence - j * 0.05), // Decrease confidence for further epochs
        })
      }
    }

    // Store predictions in database
    if (predictions.length > 0) {
      const { error: predictionsError } = await supabase
        .from("model_predictions")
        .upsert(predictions, { onConflict: "validator_pubkey,epoch" })

      if (predictionsError) {
        console.error("Error storing predictions:", predictionsError)
      }
    }

    // Log training completion
    if (trainingLog) {
      await supabase
        .from("model_training_logs")
        .update({
          training_end: new Date().toISOString(),
          loss: trainingHistory.history.loss[trainingHistory.history.loss.length - 1],
          accuracy: 1 - Math.sqrt(trainingHistory.history.val_loss[trainingHistory.history.val_loss.length - 1]),
        })
        .eq("id", trainingLog.id)
    }

    return NextResponse.json({
      success: true,
      message: "Model trained successfully",
      metrics: {
        loss: trainingHistory.history.loss[trainingHistory.history.loss.length - 1],
        val_loss: trainingHistory.history.val_loss[trainingHistory.history.val_loss.length - 1],
        accuracy: 1 - Math.sqrt(trainingHistory.history.val_loss[trainingHistory.history.val_loss.length - 1]),
      },
      predictionsGenerated: predictions.length,
    })
  } catch (error) {
    console.error("Error training model:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to train model",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0

  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length
  return Math.sqrt(avgSquareDiff)
}
