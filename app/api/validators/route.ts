import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Try to get validators from database first
    const supabase = createServerSupabaseClient()
    let dbValidators = []
    let dbError = null

    try {
      let query = supabase.from("validators").select("*")

      // Apply filters
      if (filter === "top") {
        query = query.order("performance_score", { ascending: false }).limit(20)
      } else if (filter === "recommended") {
        query = query.eq("delinquent", false).lt("risk_score", 30).order("apy", { ascending: false }).limit(20)
      } else if (filter === "delinquent") {
        query = query.eq("delinquent", true)
      } else {
        // Default pagination
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      dbValidators = data || []
    } catch (error) {
      console.error("Error fetching validators from database:", error)
      dbError = error
    }

    // If we have validators from the database, return them
    if (dbValidators.length > 0) {
      return NextResponse.json({
        success: true,
        data: dbValidators,
        source: "database",
      })
    }

    // If database failed or returned no validators, try to get them from RPC
    const voteAccountsResult = await solanaRpc.getVoteAccounts()

    if (!voteAccountsResult.success) {
      throw new Error("Failed to fetch vote accounts from RPC")
    }

    const voteAccounts = voteAccountsResult.data

    // Transform vote accounts into validator format
    const validators = [
      ...voteAccounts.current.map((v: any) => ({
        pubkey: v.votePubkey,
        name: null,
        commission: v.commission,
        activated_stake: v.activatedStake,
        last_vote: v.lastVote,
        delinquent: false,
        performance_score: Math.floor(Math.random() * 20) + 80, // 80-100 score for active validators
        risk_score: Math.floor(Math.random() * 30) + 10, // 10-40 risk for active validators
        apy: 6.5 - (v.commission / 100) * 6.5, // APY adjusted for commission
      })),
      ...voteAccounts.delinquent.map((v: any) => ({
        pubkey: v.votePubkey,
        name: null,
        commission: v.commission,
        activated_stake: v.activatedStake,
        last_vote: v.lastVote,
        delinquent: true,
        performance_score: Math.floor(Math.random() * 30) + 40, // 40-70 score for delinquent validators
        risk_score: Math.floor(Math.random() * 30) + 60, // 60-90 risk for delinquent validators
        apy: (6.5 - (v.commission / 100) * 6.5) * 0.5, // Reduced APY for delinquent validators
      })),
    ]

    // Apply filters
    let filteredValidators = validators

    if (filter === "top") {
      filteredValidators = validators
        .filter((v) => !v.delinquent)
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, 20)
    } else if (filter === "recommended") {
      filteredValidators = validators
        .filter((v) => !v.delinquent && v.risk_score < 30)
        .sort((a, b) => b.apy - a.apy)
        .slice(0, 20)
    } else if (filter === "delinquent") {
      filteredValidators = validators.filter((v) => v.delinquent)
    } else {
      // Default pagination
      filteredValidators = validators.slice(offset, offset + limit)
    }

    return NextResponse.json({
      success: true,
      data: filteredValidators,
      source: "rpc",
      dbError: dbError ? (dbError as Error).message : null,
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
