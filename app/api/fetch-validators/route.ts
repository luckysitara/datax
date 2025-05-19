import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET() {
  try {
    console.log("Fetching validators from Solana blockchain...")

    // Fetch validators from RPC
    const voteAccountsResult = await solanaRpc.getVoteAccounts()

    if (!voteAccountsResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch validators from RPC",
          error: voteAccountsResult.error,
        },
        { status: 500 },
      )
    }

    const voteAccounts = voteAccountsResult.data
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]

    // Transform vote accounts into validator format
    const validators = allValidators.map((validator) => {
      const isDelinquent = voteAccounts.delinquent.some((v) => v.votePubkey === validator.votePubkey)

      // Calculate performance score based on real metrics
      let performanceScore = 80 // Base score

      if (isDelinquent) {
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

      if (isDelinquent) {
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

    // Store in database
    const storeResult = await solanaRpc.storeValidatorsInDatabase(validators)

    if (!storeResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to store validators in database",
          error: storeResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Validators fetched and stored successfully",
      count: validators.length,
    })
  } catch (error) {
    console.error("Error fetching validators:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validators",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
