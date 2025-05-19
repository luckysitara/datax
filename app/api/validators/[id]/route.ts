import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

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

    const supabase = createServerSupabaseClient()

    // Try to get validator from database
    const { data: validator, error } = await supabase
      .from("validators")
      .select("*")
      .or(`pubkey.eq.${validatorId},vote_pubkey.eq.${validatorId}`)
      .single()

    if (error) {
      console.error("Error fetching validator from database:", error)
      // Continue to try RPC if not found in database
    }

    // If we have the validator from the database, get related data
    if (validator) {
      const validatorPubkey = validator.pubkey

      // Get historical data
      const { data: history } = await supabase
        .from("validator_history")
        .select("*")
        .eq("validator_pubkey", validatorPubkey)
        .order("time", { ascending: false })
        .limit(30)

      // Get rewards history
      const { data: rewards } = await supabase
        .from("rewards_history")
        .select("*")
        .eq("validator_pubkey", validatorPubkey)
        .order("time", { ascending: false })
        .limit(30)

      // Get risk assessments
      const { data: risks } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("validator_pubkey", validatorPubkey)
        .order("time", { ascending: false })
        .limit(30)

      // Get predictions
      const { data: predictions } = await supabase
        .from("model_predictions")
        .select("*")
        .eq("validator_pubkey", validatorPubkey)
        .order("epoch", { ascending: true })
        .limit(5)

      return NextResponse.json({
        success: true,
        data: {
          validator,
          history: history || [],
          rewards: rewards || [],
          risks: risks || [],
          predictions: predictions || [],
        },
        source: "database",
      })
    }

    // If database failed or returned no validator, try to get from RPC
    try {
      const voteAccounts = await solanaRpc.getVoteAccounts()
      const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]

      // Find the validator with the matching ID (either node pubkey or vote pubkey)
      const voteAccount = allValidators.find((v) => v.nodePubkey === validatorId || v.votePubkey === validatorId)

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
      const isDelinquent = voteAccounts.delinquent.some((v) => v.votePubkey === voteAccount.votePubkey)

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
      const commissionImpact = (voteAccount.commission / 100) * baseAPY
      const apy = baseAPY - commissionImpact

      const validatorData = {
        pubkey: voteAccount.nodePubkey,
        vote_pubkey: voteAccount.votePubkey,
        name: `Validator ${voteAccount.votePubkey.substring(0, 8)}`,
        commission: voteAccount.commission,
        activated_stake: voteAccount.activatedStake,
        last_vote: voteAccount.lastVote,
        delinquent: isDelinquent,
        performance_score: performanceScore,
        risk_score: riskScore,
        apy,
      }

      return NextResponse.json({
        success: true,
        data: {
          validator: validatorData,
          history: [],
          rewards: [],
          risks: [],
          predictions: [],
        },
        source: "rpc",
      })
    } catch (rpcError) {
      console.error("Error fetching validator from RPC:", rpcError)
      return NextResponse.json(
        {
          success: false,
          message: "Validator not found in database or RPC",
          error: (rpcError as Error).message,
        },
        { status: 404 },
      )
    }
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
