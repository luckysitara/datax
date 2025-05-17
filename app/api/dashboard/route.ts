import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"

// Function to fetch Solana network data
async function fetchSolanaData() {
  console.log("Fetching Solana network data...")

  // Make individual RPC calls with proper error handling
  const [slotResult, epochInfoResult, voteAccountsResult] = await Promise.all([
    solanaRpc.getCurrentSlot(),
    solanaRpc.getEpochInfo(),
    solanaRpc.getVoteAccounts(),
  ])

  if (!slotResult.success || !epochInfoResult.success || !voteAccountsResult.success) {
    throw new Error("Failed to fetch critical network data")
  }

  const currentSlot = slotResult.data
  const epochInfo = epochInfoResult.data
  const voteAccounts = voteAccountsResult.data

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

  // Get supply numbers (estimated)
  const circulatingSupply = 560 // ~560M SOL in circulation as of 2023
  const totalSupply = 600 // ~600M SOL total supply as of 2023
  const circulatingPercentage = (circulatingSupply / totalSupply) * 100

  // Format stake numbers
  const activeStake = totalActiveStake / 1e9 // Convert lamports to SOL
  const activeStakePercentage = (activeStake / circulatingSupply) * 100

  // Estimate APY based on inflation rate and commission
  const estimatedApy = 6.5 // ~6.5% APY for staking as of 2023

  // Fetch transaction count with a safe fallback
  let transactionCount = null
  try {
    const transactionCountResult = await solanaRpc.getTransactionCount()
    if (transactionCountResult.success) {
      transactionCount = transactionCountResult.data
    }
  } catch (error) {
    console.error("Error fetching transaction count:", error)
  }

  return {
    network: {
      currentSlot,
      currentEpoch: epochInfo.epoch,
      epochProgress: epochProgress.toFixed(2),
      timeUntilNextEpoch,
      slotsInEpoch: epochInfo.slotsInEpoch,
      slotTime: "0.4", // This is the target slot time for Solana
      transactionCount: transactionCount,
      currentTps: "1500", // Estimated average TPS
      recentBlockhash: null,
      blockTime: 0.4,
      version: "1.14.17", // Estimated version
    },
    validators: {
      total: totalValidators,
      active: activeValidators,
      delinquent: delinquentValidatorsCount,
      averageCommission: averageCommission !== null ? averageCommission.toFixed(2) : null,
      skipRate: "1.2", // Estimated
      estimatedApy: estimatedApy.toFixed(2),
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

    return NextResponse.json({
      success: true,
      data: networkData,
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
