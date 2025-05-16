import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"

    // Get validator data from database
    const supabase = createServerSupabaseClient()
    let query = supabase.from("validators").select("*")

    // Apply filters
    if (filter === "delinquent") {
      query = query.eq("delinquent", true)
    } else if (filter === "top") {
      query = query.order("performance_score", { ascending: false }).limit(20)
    } else if (filter === "recommended") {
      // Recommended validators: high performance, low risk, reasonable commission
      query = query
        .eq("delinquent", false)
        .gt("performance_score", 80)
        .lt("risk_score", 30)
        .lt("commission", 10)
        .order("performance_score", { ascending: false })
        .limit(20)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // If no data in database, try to fetch from RPC
    if (!data || data.length === 0) {
      console.log("No validators in database, fetching from RPC...")

      const voteAccountsResult = await solanaRpc.getVoteAccounts()

      if (!voteAccountsResult.success) {
        throw new Error("Failed to fetch validators from RPC")
      }

      const voteAccounts = voteAccountsResult.data
      const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]

      // Transform vote accounts into validator format
      const validators = await Promise.all(
        allValidators.map(async (validator: any) => {
          const isDelinquent = voteAccounts.delinquent.some((v: any) => v.votePubkey === validator.votePubkey)

          // Try to get validator name from identity
          let name = null
          try {
            const accountInfoResult = await solanaRpc.getAccountInfo(validator.nodePubkey)
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
            console.error(`Error getting validator name for ${validator.votePubkey}:`, error)
          }

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
            name,
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
        }),
      )

      // Apply filters to RPC data
      let filteredValidators = validators

      if (filter === "delinquent") {
        filteredValidators = validators.filter((v) => v.delinquent)
      } else if (filter === "top") {
        filteredValidators = validators
          .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
          .slice(0, 20)
      } else if (filter === "recommended") {
        filteredValidators = validators
          .filter(
            (v) => !v.delinquent && (v.performance_score || 0) > 80 && (v.risk_score || 0) < 30 && v.commission < 10,
          )
          .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
          .slice(0, 20)
      }

      return NextResponse.json({
        success: true,
        data: filteredValidators,
        source: "rpc",
      })
    }

    return NextResponse.json({
      success: true,
      data,
      source: "database",
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
