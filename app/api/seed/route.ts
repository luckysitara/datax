import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

// Helper function to generate random validator data
function generateValidatorData(count: number) {
  const validators = []
  const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))

  for (let i = 0; i < count; i++) {
    // Generate a random pubkey
    const pubkey = Array.from(
      { length: 44 },
      () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)],
    ).join("")

    // Generate random validator properties
    const commission = Math.floor(Math.random() * 10) + 1
    const activatedStake = Math.floor(Math.random() * 10000000000000) + 100000000000
    const delinquent = Math.random() > 0.9
    const performanceScore = delinquent ? Math.floor(Math.random() * 30) + 40 : Math.floor(Math.random() * 20) + 80
    const riskScore = delinquent ? Math.floor(Math.random() * 30) + 60 : Math.floor(Math.random() * 40) + 10
    const baseAPY = 6.5
    const commissionImpact = (commission / 100) * baseAPY
    const apy = baseAPY - commissionImpact

    validators.push({
      pubkey,
      name: `Validator ${i + 1}`,
      commission,
      activated_stake: activatedStake,
      last_vote: Math.floor(Date.now() / 400) - Math.floor(Math.random() * 1000),
      delinquent,
      performance_score: performanceScore,
      risk_score: riskScore,
      apy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Generate history data for each validator
    for (let j = 0; j < 10; j++) {
      const epoch = currentEpoch - j
      const historicalCommission = commission + (Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0)
      const historicalStake = activatedStake - j * Math.floor(Math.random() * 1000000000)
      const historicalDelinquent = j === 0 ? delinquent : Math.random() > 0.95
      const uptime = historicalDelinquent ? 95 + Math.random() * 4 : 99 + Math.random() * 0.9
      const skipRate = historicalDelinquent ? 0.5 + Math.random() * 1.5 : 0.1 + Math.random() * 0.3
      const historicalPerformance = historicalDelinquent
        ? Math.floor(Math.random() * 30) + 40
        : Math.floor(Math.random() * 20) + 80 - j * 0.5

      validators.push({
        validator_history: {
          validator_pubkey: pubkey,
          epoch,
          commission: historicalCommission,
          activated_stake: historicalStake,
          delinquent: historicalDelinquent,
          uptime,
          skip_rate: skipRate,
          performance_score: historicalPerformance,
          created_at: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString(),
        },
      })

      // Generate rewards data
      const historicalAPY = baseAPY - (historicalCommission / 100) * baseAPY - j * 0.05 + (Math.random() * 0.2 - 0.1)
      const reward = Math.floor(Math.random() * 1000) + 500

      validators.push({
        rewards_history: {
          validator_pubkey: pubkey,
          epoch,
          reward,
          apy: historicalAPY,
          created_at: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString(),
        },
      })

      // Generate risk assessment data
      const delinquencyRisk = historicalDelinquent ? 80 : 10
      const concentrationRisk = Math.floor(Math.random() * 30) + 10
      const uptimeRisk = historicalDelinquent ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15) + 5
      const skipRateRisk = historicalDelinquent
        ? Math.floor(Math.random() * 30) + 20
        : Math.floor(Math.random() * 15) + 5
      const commissionChangeRisk = Math.floor(Math.random() * 10) + 5

      validators.push({
        risk_assessments: {
          validator_pubkey: pubkey,
          epoch,
          risk_score: historicalDelinquent ? 70 + (Math.random() * 10 - 5) : 25 + (Math.random() * 10 - 5),
          delinquency_risk: delinquencyRisk,
          concentration_risk: concentrationRisk,
          uptime_risk: uptimeRisk,
          skip_rate_risk: skipRateRisk,
          commission_change_risk: commissionChangeRisk,
          created_at: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString(),
        },
      })

      // Generate prediction data (only for future epochs)
      if (j < 5) {
        const futureEpoch = currentEpoch + j + 1
        const predictedAPY = historicalAPY + (Math.random() * 0.4 - 0.2)
        const minAPY = predictedAPY - 0.5 - Math.random() * 0.5
        const maxAPY = predictedAPY + 0.5 + Math.random() * 0.5
        const predictedRisk = historicalDelinquent ? 65 + (Math.random() * 10 - 5) : 20 + (Math.random() * 10 - 5)
        const confidence = 0.7 + Math.random() * 0.25

        validators.push({
          model_predictions: {
            validator_pubkey: pubkey,
            epoch: futureEpoch,
            predicted_apy: predictedAPY,
            min_apy: minAPY,
            max_apy: maxAPY,
            predicted_risk: predictedRisk,
            confidence,
            created_at: new Date().toISOString(),
          },
        })
      }
    }
  }

  return validators
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if we already have data
    const { count: validatorCount } = await supabase.from("validators").select("*", { count: "exact", head: true })

    if (validatorCount && validatorCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already seeded",
        validatorCount,
      })
    }

    // Fetch validators from RPC
    console.log("Fetching validators from RPC...")
    const voteAccounts = await solanaRpc.getVoteAccounts()
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]

    // Transform vote accounts into validator format
    const validators = allValidators.map((validator) => {
      const isDelinquent = voteAccounts.delinquent.some((v) => v.votePubkey === validator.votePubkey)

      // Calculate performance score based on real metrics
      let performanceScore = 80 // Base score

      if (isDelinquent) {
        performanceScore = 50 // Lower score for delinquent validators
      }

      // Calculate risk score based on real metrics
      let riskScore = 25 // Base risk

      if (isDelinquent) {
        riskScore = 75 // High risk for delinquent validators
      }

      // Calculate APY based on commission
      // Base APY for Solana is around 6-7%
      const baseAPY = 6.5
      const commissionImpact = (validator.commission / 100) * baseAPY
      const apy = baseAPY - commissionImpact

      return {
        pubkey: validator.votePubkey,
        name: `Validator ${validator.votePubkey.substring(0, 8)}`,
        commission: validator.commission,
        activated_stake: validator.activatedStake,
        last_vote: validator.lastVote,
        delinquent: isDelinquent,
        performance_score: performanceScore,
        risk_score: riskScore,
        apy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert validators in batches to avoid request size limits
    const BATCH_SIZE = 100
    for (let i = 0; i < validators.length; i += BATCH_SIZE) {
      const batch = validators.slice(i, i + BATCH_SIZE)

      const { error } = await supabase.from("validators").insert(batch)

      if (error) {
        console.error(`Error inserting validators batch ${i}/${validators.length}:`, error)
      }
    }

    // Fetch recent blocks
    console.log("Fetching recent blocks...")
    const blocks = await solanaRpc.getRecentBlocks(20)

    // Store blocks in database
    if (blocks.length > 0) {
      const blocksToInsert = blocks.map((block) => ({
        slot: block.slot,
        block_time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
        block_height: block.blockHeight,
        leader: block.leader,
        transactions: block.transactions,
        fees: block.fees,
        created_at: new Date().toISOString(),
      }))

      const { error: blockError } = await supabase.from("blocks").insert(blocksToInsert)

      if (blockError) {
        console.error("Error inserting blocks:", blockError)
      }
    }

    // Generate mock data for analytics
    console.log("Generating mock data for analytics...")

    // Generate reward history
    const rewardHistory = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const baseApy = 6.5 + Math.random() * 0.5 - 0.25 // 6.25% to 6.75%
      const minApy = baseApy - 0.5 - Math.random() * 0.3 // 0.5% to 0.8% lower
      const maxApy = baseApy + 0.5 + Math.random() * 0.3 // 0.5% to 0.8% higher

      return {
        epoch: 300 - i,
        time: date.toISOString(),
        avg_apy: baseApy,
        min_apy: minApy,
        max_apy: maxApy,
        avg_reward: 0.05 + Math.random() * 0.02 - 0.01, // 0.04 to 0.06 SOL
        total_rewards: 50000 + Math.random() * 10000 - 5000, // 45,000 to 55,000 SOL
      }
    })

    const { error: rewardError } = await supabase.from("rewards_history").insert(rewardHistory)

    if (rewardError) {
      console.error("Error inserting reward history:", rewardError)
    }

    // Generate stake distribution
    const totalStake = allValidators.reduce((sum, validator) => sum + validator.activatedStake, 0)
    const top10Validators = [...allValidators].sort((a, b) => b.activatedStake - a.activatedStake).slice(0, 10)
    const top10Stake = top10Validators.reduce((sum, validator) => sum + validator.activatedStake, 0)

    const distribution = [
      {
        category: "Top 10 Validators",
        stake: top10Stake,
        percentage: (top10Stake / totalStake) * 100,
      },
      {
        category: "Other Validators",
        stake: totalStake - top10Stake,
        percentage: ((totalStake - top10Stake) / totalStake) * 100,
      },
    ]

    const { error: stakeError } = await supabase.from("stake_distribution").insert({
      distribution,
      total_stake: totalStake,
      created_at: new Date().toISOString(),
    })

    if (stakeError) {
      console.error("Error inserting stake distribution:", stakeError)
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      validatorCount: validators.length,
      blockCount: blocks.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
