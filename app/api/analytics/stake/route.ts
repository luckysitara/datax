import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Try to get stake distribution from database
    const { data: stakeData, error } = await supabase
      .from("stake_distribution")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)

    // If we have data in the database, return it
    if (!error && stakeData && stakeData.length > 0) {
      return NextResponse.json({
        success: true,
        data: stakeData[0].distribution,
        source: "database",
      })
    }

    // Otherwise, calculate from validators
    const voteAccountsResult = await solanaRpc.getVoteAccounts()

    if (!voteAccountsResult.success) {
      // Generate mock data if RPC fails
      console.log("Generating mock stake distribution data...")
      const mockDistribution = [
        {
          category: "Top 10 Validators",
          stake: 100000000000000,
          percentage: 33,
        },
        {
          category: "Other Validators",
          stake: 200000000000000,
          percentage: 67,
        },
      ]

      return NextResponse.json({
        success: true,
        data: mockDistribution,
        source: "mock",
      })
    }

    const voteAccounts = voteAccountsResult.data
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]

    // Sort validators by stake
    const sortedValidators = [...allValidators].sort((a, b) => b.activatedStake - a.activatedStake)

    // Calculate total stake
    const totalStake = sortedValidators.reduce((sum, validator) => sum + validator.activatedStake, 0)

    // Take top 10 validators
    const top10Validators = sortedValidators.slice(0, 10)
    const top10Stake = top10Validators.reduce((sum, validator) => sum + validator.activatedStake, 0)

    // Create distribution data
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

    // Store in database for future use
    await supabase.from("stake_distribution").insert({
      distribution,
      total_stake: totalStake,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: distribution,
      source: "calculated",
    })
  } catch (error) {
    console.error("Error fetching stake distribution:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stake distribution",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
