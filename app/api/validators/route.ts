import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "50")
    const offset = Number(searchParams.get("offset") || "0")
    const sort = searchParams.get("sort") || "activated_stake"
    const order = searchParams.get("order") || "desc"
    const filter = searchParams.get("filter") || "all"
    const search = searchParams.get("search") || ""

    // Try to get validators from database first
    const dbResult = await solanaRpc.getValidatorsFromDatabase({
      limit,
      offset,
      sort,
      order: order as "asc" | "desc",
      filter,
      search,
    })

    // If we have data in the database, return it
    if (dbResult.success && dbResult.data && dbResult.data.length > 0) {
      return NextResponse.json({
        success: true,
        data: dbResult.data,
        count: dbResult.count,
        source: "database",
      })
    }

    // Fetch from RPC
    console.log("Fetching validators from RPC...")
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

    // Store validators in database for future use
    solanaRpc.storeValidatorsInDatabase(validators).catch((error) => {
      console.error("Error storing validators in database:", error)
    })

    // Apply filters to RPC data
    let filteredValidators = validators

    if (filter === "delinquent") {
      filteredValidators = validators.filter((v) => v.delinquent)
    } else if (filter === "active") {
      filteredValidators = validators.filter((v) => !v.delinquent)
    } else if (filter === "top_performance") {
      filteredValidators = validators.filter((v) => v.performance_score >= 80)
    } else if (filter === "low_risk") {
      filteredValidators = validators.filter((v) => v.risk_score <= 30)
    }

    // Apply search to RPC data
    if (search) {
      const searchLower = search.toLowerCase()
      filteredValidators = filteredValidators.filter(
        (v) => v.name.toLowerCase().includes(searchLower) || v.pubkey.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting to RPC data
    if (sort) {
      filteredValidators.sort((a, b) => {
        const aValue = a[sort as keyof typeof a]
        const bValue = b[sort as keyof typeof b]

        if (typeof aValue === "number" && typeof bValue === "number") {
          return order === "asc" ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    // Apply pagination to RPC data
    const paginatedValidators = filteredValidators.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedValidators,
      count: filteredValidators.length,
      source: "rpc",
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
