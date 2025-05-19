import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Try to get latest network stats from database
    const { data: latestStats, error } = await supabase
      .from("network_stats")
      .select("*")
      .order("time", { ascending: false })
      .limit(1)
      .single()

    // If we have recent stats (less than 5 minutes old), return them
    if (!error && latestStats && new Date(latestStats.time).getTime() > Date.now() - 5 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        data: latestStats,
        source: "database",
      })
    }

    // Otherwise, fetch from RPC
    console.log("Fetching network stats from RPC...")

    // Get data from RPC
    const [currentSlot, epochInfo, voteAccounts, supplyInfo, tps] = await Promise.all([
      solanaRpc.getCurrentSlot(),
      solanaRpc.getEpochInfo(),
      solanaRpc.getVoteAccounts(),
      solanaRpc.getSupplyInfo(),
      solanaRpc.getCurrentTPS(),
    ])

    // Calculate active stake
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
    const activeStake = allValidators.reduce((sum, validator) => sum + Number(validator.activatedStake), 0)

    // Create network stats object
    const networkStats = {
      time: new Date().toISOString(),
      current_slot: currentSlot,
      current_epoch: epochInfo.epoch,
      tps,
      validator_count: allValidators.length,
      active_stake: activeStake,
      total_supply: supplyInfo.value.total,
      circulating_supply: supplyInfo.value.circulating,
    }

    // Store in database
    await supabase.from("network_stats").insert(networkStats)

    return NextResponse.json({
      success: true,
      data: networkStats,
      source: "rpc",
    })
  } catch (error) {
    console.error("Error fetching network stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch network stats",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
