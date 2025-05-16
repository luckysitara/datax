import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const validatorId = params.id
    let validator = null
    let dbError = null

    // Try to get validator from database first
    const supabase = createServerSupabaseClient()
    try {
      const { data, error } = await supabase.from("validators").select("*").eq("pubkey", validatorId).single()

      if (error) {
        throw error
      }

      validator = data
    } catch (error) {
      console.error("Error fetching validator from database:", error)
      dbError = error
    }

    // If we have the validator from the database, get related data
    if (validator) {
      let history = []
      let rewards = []
      let risks = []
      let predictions = []

      try {
        // Get validator history
        const { data: historyData, error: historyError } = await supabase
          .from("validator_history")
          .select("*")
          .eq("validator_pubkey", validatorId)
          .order("epoch", { ascending: false })
          .limit(10)

        if (!historyError) {
          history = historyData || []
        }

        // Get rewards history
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards_history")
          .select("*")
          .eq("validator_pubkey", validatorId)
          .order("epoch", { ascending: false })
          .limit(10)

        if (!rewardsError) {
          rewards = rewardsData || []
        }

        // Get risk assessments
        const { data: risksData, error: risksError } = await supabase
          .from("risk_assessments")
          .select("*")
          .eq("validator_pubkey", validatorId)
          .order("epoch", { ascending: false })
          .limit(10)

        if (!risksError) {
          risks = risksData || []
        }

        // Get predictions
        const { data: predictionsData, error: predictionsError } = await supabase
          .from("model_predictions")
          .select("*")
          .eq("validator_pubkey", validatorId)
          .order("epoch", { ascending: true })
          .limit(5)

        if (!predictionsError) {
          predictions = predictionsData || []
        }
      } catch (error) {
        console.error("Error fetching related data:", error)
      }

      return NextResponse.json({
        success: true,
        data: {
          validator,
          history,
          rewards,
          risks,
          predictions,
        },
        source: "database",
      })
    }

    // If database failed or returned no validator, try to get from RPC
    const voteAccountsResult = await solanaRpc.getVoteAccounts()

    if (!voteAccountsResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch validator data from RPC",
          error: voteAccountsResult.error,
        },
        { status: 500 },
      )
    }

    const voteAccounts = voteAccountsResult.data

    // Find the validator with the matching ID
    const voteAccount = [...voteAccounts.current, ...voteAccounts.delinquent].find(
      (v: any) => v.votePubkey === validatorId,
    )

    if (!voteAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Validator not found",
        },
        { status: 404 },
      )
    }

    // Transform vote account into validator format
    const isDelinquent = voteAccounts.delinquent.some((v: any) => v.votePubkey === validatorId)
    const commission = voteAccount.commission
    const activatedStake = voteAccount.activatedStake

    // Try to get validator name from identity
    let name = null
    try {
      const accountInfoResult = await solanaRpc.getAccountInfo(voteAccount.nodePubkey)
      if (accountInfoResult.success && accountInfoResult.data && accountInfoResult.data.data) {
        const buffer = Buffer.from(accountInfoResult.data.data[0], "base64")
        const stringData = buffer.toString("utf8")
        const jsonStart = stringData.indexOf("{")
        if (jsonStart !== -1) {
          const jsonString = stringData.slice(jsonStart).trim()
          const metadata = JSON.parse(jsonString)
          if (metadata.name) {
            name = metadata.name
          }
        }
      }
    } catch (error) {
      console.error(`Error getting validator name for ${validatorId}:`, error)
    }

    // Calculate performance score based on real metrics
    let performanceScore = 80 // Base score

    if (isDelinquent) {
      performanceScore = 50 // Lower score for delinquent validators
    } else {
      // Adjust based on last vote (more recent = better)
      const currentSlot = Math.floor(Date.now() / 400) // Approximate current slot
      const slotsSinceLastVote = currentSlot - voteAccount.lastVote

      if (slotsSinceLastVote < 100) {
        performanceScore += 10
      } else if (slotsSinceLastVote > 1000) {
        performanceScore -= 10
      }

      // Adjust based on commission (lower = better for delegators)
      if (commission < 5) {
        performanceScore += 5
      } else if (commission > 10) {
        performanceScore -= 5
      }
    }

    // Calculate risk score based on real metrics
    let riskScore = 25 // Base risk

    if (isDelinquent) {
      riskScore = 75 // High risk for delinquent validators
    } else {
      // High stake concentration is a risk
      if (activatedStake > 500_000_000_000) {
        riskScore += 20
      }

      // High commission is a risk
      if (commission > 10) {
        riskScore += 10
      }
    }

    // Calculate APY based on commission
    // Base APY for Solana is around 6-7%
    const baseAPY = 6.5
    const commissionImpact = (commission / 100) * baseAPY
    const apy = baseAPY - commissionImpact

    validator = {
      pubkey: validatorId,
      name: name,
      commission,
      activated_stake: activatedStake,
      last_vote: voteAccount.lastVote,
      delinquent: isDelinquent,
      performance_score: performanceScore,
      risk_score: riskScore,
      apy,
    }

    return NextResponse.json({
      success: true,
      data: {
        validator,
        history: [],
        rewards: [],
        risks: [],
        predictions: [],
      },
      source: "rpc",
      dbError: dbError ? (dbError as Error).message : null,
    })
  } catch (error) {
    console.error("Error fetching validator:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validator",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
