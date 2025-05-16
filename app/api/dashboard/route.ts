import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

// Function to fetch Solana network data
async function fetchSolanaData() {
  console.log("Fetching Solana network data...")

  // Make individual RPC calls with proper error handling
  const [slotResult, epochInfoResult, voteAccountsResult, versionResult, transactionCountResult, supplyResult] =
    await Promise.all([
      solanaRpc.getCurrentSlot(),
      solanaRpc.getEpochInfo(),
      solanaRpc.getVoteAccounts(),
      solanaRpc.getVersion(),
      solanaRpc.getTransactionCount(),
      solanaRpc.getSupply(),
    ])

  if (!slotResult.success || !epochInfoResult.success || !voteAccountsResult.success) {
    throw new Error("Failed to fetch critical network data")
  }

  const currentSlot = slotResult.data
  const epochInfo = epochInfoResult.data
  const voteAccounts = voteAccountsResult.data
  const version = versionResult.success ? versionResult.data : { "solana-core": "unknown" }
  const transactionCount = transactionCountResult.success ? transactionCountResult.data : null
  const supply = supplyResult.success ? supplyResult.data : null

  // Calculate active stake with safe access
  const currentValidators = Array.isArray(voteAccounts.current) ? voteAccounts.current : []
  const delinquentValidators = Array.isArray(voteAccounts.delinquent) ? voteAccounts.delinquent : []

  const totalActiveStake =
    currentValidators.reduce((sum, validator) => sum + Number(validator.activatedStake || 0), 0) +
    delinquentValidators.reduce((sum, validator) => sum + Number(validator.activatedStake || 0), 0)

  // Calculate epoch progress
  const epochProgress = (epochInfo.slotIndex / Math.max(1, epochInfo.slotsInEpoch)) * 100

  // Calculate estimated time until next epoch
  const slotsRemaining = Math.max(0, epochInfo.slotsInEpoch - epochInfo.slotIndex)
  const estimatedTimePerSlot = 0.4 // Solana targets ~400ms per slot
  const secondsUntilNextEpoch = slotsRemaining * estimatedTimePerSlot

  // Format time until next epoch
  const hours = Math.floor(secondsUntilNextEpoch / 3600)
  const minutes = Math.floor((secondsUntilNextEpoch % 3600) / 60)
  const timeUntilNextEpoch = `${hours}h ${minutes}m`

  // Calculate validator statistics
  const totalValidators = currentValidators.length + delinquentValidators.length
  const activeValidators = currentValidators.length
  const delinquentValidatorsCount = delinquentValidators.length

  // Calculate average commission
  let averageCommission = null
  if (activeValidators > 0) {
    const totalCommission = currentValidators.reduce((sum, validator) => sum + (Number(validator.commission) || 0), 0)
    averageCommission = totalCommission / activeValidators
  }

  // Get supply numbers from RPC if available
  let circulatingSupply = 0
  let totalSupply = 0
  let circulatingPercentage = 0

  if (supply) {
    circulatingSupply = supply.circulating / 1e9 // Convert lamports to SOL
    totalSupply = supply.total / 1e9 // Convert lamports to SOL
    circulatingPercentage = (circulatingSupply / totalSupply) * 100
  }

  // Format stake numbers
  const activeStake = totalActiveStake / 1e9 // Convert lamports to SOL
  const activeStakePercentage = (activeStake / circulatingSupply) * 100

  // Calculate APY based on inflation rate and commission
  // This is an approximation based on Solana's inflation schedule
  const estimatedApy = 6.5 // ~6.5% APY for staking as of 2023

  // Get current TPS from recent blocks
  let currentTps = 0
  try {
    const recentBlocksResult = await solanaRpc.getRecentBlocks(5)
    if (recentBlocksResult.success) {
      const blocks = recentBlocksResult.data
      const totalTxs = blocks.reduce((sum, block) => sum + (block.transactions || 0), 0)
      const avgTxsPerBlock = totalTxs / blocks.length
      currentTps = avgTxsPerBlock / 0.4 // 0.4 seconds per slot
    }
  } catch (error) {
    console.error("Error calculating TPS:", error)
  }

  return {
    network: {
      currentSlot,
      currentEpoch: epochInfo.epoch,
      epochProgress: epochProgress.toFixed(2),
      timeUntilNextEpoch,
      slotsInEpoch: epochInfo.slotsInEpoch,
      slotTime: "0.4", // This is the target slot time for Solana
      currentTps: currentTps.toFixed(2),
      blockTime: null,
      version: version ? `${version["solana-core"]}` : null,
      transactionCount,
    },
    validators: {
      total: totalValidators,
      active: activeValidators,
      delinquent: delinquentValidatorsCount,
      averageCommission: averageCommission !== null ? averageCommission.toFixed(2) : null,
      skipRate: null, // We don't have real skip rate data
      estimatedApy: estimatedApy.toFixed(2),
      superminority: null,
    },
    supply: {
      circulating: circulatingSupply.toFixed(2),
      total: totalSupply.toFixed(2),
      circulatingPercentage: circulatingPercentage.toFixed(2),
      activeStake: activeStake.toFixed(2),
      activeStakePercentage: activeStakePercentage.toFixed(2),
    },
  }
}

export async function GET() {
  try {
    console.log("Starting dashboard data fetch...")

    // Fetch Solana network data
    const networkData = await fetchSolanaData()

    // Get validator data from database
    let validators = []
    let dbError = null

    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("validators").select("*")

      if (error) {
        throw error
      }

      validators = data || []
    } catch (error) {
      console.error("Error fetching validators from database:", error)
      dbError = error
    }

    return NextResponse.json({
      success: true,
      data: {
        network: networkData.network,
        validators: networkData.validators,
        supply: networkData.supply,
        dbValidators: validators,
        dbError: dbError ? (dbError as Error).message : null,
      },
    })
  } catch (error) {
    console.error("Error in dashboard data fetch:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
