import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { fetchAllValidatorData } from "@/utils/fetch-all-validator-data"

export async function GET() {
  try {
    console.log("Starting validator data fetch...")
    const supabase = createServerSupabaseClient()

    // Fetch all validator data using our utility
    const validatorData = await fetchAllValidatorData()
    const currentEpoch = validatorData.epoch

    console.log(`Processing ${validatorData.validators.length} validators...`)

    // Process and store validator data
    const processedValidators = validatorData.validators.map((validator) => {
      // Use metadata name if available
      const name = validator.metadata?.name || null

      // Calculate performance score based on real metrics
      let performanceScore = 80 // Base score

      if (validator.delinquent) {
        performanceScore = 50 // Lower score for delinquent validators
      } else {
        // Adjust based on last vote (more recent = better)
        const currentSlot = Math.floor(Date.now() / 400) // Approximate current slot
        const slotsSinceLastVote = currentSlot - validator.lastVote

        if (slotsSinceLastVote < 100) {
          performanceScore += 10
        } else if (slotsSinceLastVote > 1000) {
          performanceScore -= 10
        }

        // Adjust based on commission (lower = better for delegators)
        if (validator.commission < 5) {
          performanceScore += 5
        } else if (validator.commission > 10) {
          performanceScore -= 5
        }
      }

      // Calculate risk score based on real metrics
      let riskScore = 25 // Base risk

      if (validator.delinquent) {
        riskScore = 75 // High risk for delinquent validators
      } else {
        // High stake concentration is a risk
        if (validator.activatedStake > 500_000_000_000) {
          riskScore += 20
        }

        // High commission is a risk
        if (validator.commission > 10) {
          riskScore += 10
        }
      }

      // Calculate APY based on commission
      // Base APY for Solana is around 6-7%
      const baseAPY = 6.5
      const commissionImpact = (validator.commission / 100) * baseAPY
      const apy = baseAPY - commissionImpact

      return {
        pubkey: validator.votePubkey,
        name: name,
        commission: validator.commission,
        activated_stake: validator.activatedStake,
        last_vote: validator.lastVote,
        delinquent: validator.delinquent,
        performance_score: performanceScore,
        risk_score: riskScore,
        apy: apy,
        updated_at: new Date().toISOString(),
      }
    })

    console.log(`Processed ${processedValidators.length} validators, storing in database...`)

    // First, store all validators in the main table
    let validatorsStored = 0
    for (const validator of processedValidators) {
      try {
        const { error } = await supabase.from("validators").upsert(validator, { onConflict: "pubkey" })
        if (error) {
          console.error(`Error storing validator ${validator.pubkey}:`, error)
        } else {
          validatorsStored++
        }
      } catch (error) {
        console.error(`Error storing validator ${validator.pubkey}:`, error)
      }
    }

    console.log(`Stored ${validatorsStored} validators in main table, now storing related data...`)

    // Then, store related data
    let successCount = 0
    for (const validator of processedValidators) {
      try {
        // Store validator history
        const { error: historyError } = await supabase.from("validator_history").upsert(
          {
            validator_pubkey: validator.pubkey,
            epoch: currentEpoch,
            commission: validator.commission,
            activated_stake: validator.activated_stake,
            delinquent: validator.delinquent,
            performance_score: validator.performance_score,
          },
          { onConflict: "validator_pubkey, epoch" },
        )

        if (historyError) {
          console.error(`Error storing history for validator ${validator.pubkey}:`, historyError)
          continue
        }

        // Store risk assessment
        const { error: riskError } = await supabase.from("risk_assessments").upsert(
          {
            validator_pubkey: validator.pubkey,
            epoch: currentEpoch,
            risk_score: validator.risk_score || 0,
            delinquency_risk: validator.delinquent ? 80 : 10,
            concentration_risk: validator.activated_stake > 500_000_000_000 ? 60 : 20,
            uptime_risk: null,
            skip_rate_risk: null,
            commission_change_risk: null,
          },
          { onConflict: "validator_pubkey, epoch" },
        )

        if (riskError) {
          console.error(`Error storing risk assessment for validator ${validator.pubkey}:`, riskError)
          continue
        }

        // Store rewards history
        const { error: rewardError } = await supabase.from("rewards_history").upsert(
          {
            validator_pubkey: validator.pubkey,
            epoch: currentEpoch > 0 ? currentEpoch - 1 : 0, // Rewards are from previous epoch
            reward: null, // We don't have real reward data
            apy: validator.apy,
          },
          { onConflict: "validator_pubkey, epoch" },
        )

        if (rewardError) {
          console.error(`Error storing rewards for validator ${validator.pubkey}:`, rewardError)
          continue
        }

        successCount++
      } catch (error) {
        console.error(`Error storing related data for validator ${validator.pubkey}:`, error)
      }
    }

    console.log(`Successfully stored complete data for ${successCount} validators out of ${processedValidators.length}`)

    return NextResponse.json({
      success: true,
      message: `Fetched and stored data for ${successCount} validators`,
      currentEpoch,
      totalValidators: processedValidators.length,
    })
  } catch (error) {
    console.error("Error in validator data fetch:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validator data",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
