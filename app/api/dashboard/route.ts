import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET() {
  try {
    // Fetch data from Solana RPC
    const [slotResult, epochInfoResult, voteAccountsResult, supplyResult, tpsResult] = await Promise.all([
      solanaRpc.getCurrentSlot(),
      solanaRpc.getEpochInfo(),
      solanaRpc.getVoteAccounts(),
      solanaRpc.getSupplyInfo(),
      solanaRpc.getCurrentTPS(),
    ])

    // Check if any of the critical requests failed
    if (!slotResult.success || !epochInfoResult.success || !voteAccountsResult.success || !supplyResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch critical network data",
          errors: {
            slot: slotResult.error,
            epochInfo: epochInfoResult.error,
            voteAccounts: voteAccountsResult.error,
            supply: supplyResult.error,
          },
        },
        { status: 500 },
      )
    }

    const currentSlot = slotResult.data
    const epochInfo = epochInfoResult.data
    const voteAccounts = voteAccountsResult.data
    const supply = supplyResult.data
    const tps = tpsResult.success ? tpsResult.data : 0

    // Process validators
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
    const activeValidators = voteAccounts.current.length
    const delinquentValidators = voteAccounts.delinquent.length
    const totalValidators = activeValidators + delinquentValidators

    // Calculate total stake
    const totalStake = allValidators.reduce((sum, validator) => sum + Number(validator.activatedStake), 0)

    // Calculate average commission
    const totalCommission = allValidators.reduce((sum, validator) => sum + validator.commission, 0)
    const averageCommission = (totalCommission / totalValidators).toFixed(2)

    // Base APY for Solana is around 6-7%
    const baseAPY = 6.5
    const estimatedApy = (baseAPY - baseAPY * (Number(averageCommission) / 100)).toFixed(2)

    // Calculate epoch progress
    const slotsInEpoch = epochInfo.slotsInEpoch
    const slotInEpoch = epochInfo.slotIndex
    const slotProgress = (slotInEpoch / slotsInEpoch) * 100

    return NextResponse.json({
      success: true,
      data: {
        network: {
          currentSlot,
          epoch: epochInfo.epoch,
          slotsInEpoch,
          slotInEpoch,
          slotProgress,
          tps,
        },
        validators: {
          total: totalValidators,
          active: activeValidators,
          delinquent: delinquentValidators,
          delinquentRate: (delinquentValidators / totalValidators) * 100,
          averageCommission,
          estimatedApy,
        },
        supply: {
          total: (supply.value.total / 1e9).toFixed(2),
          circulating: (supply.value.circulating / 1e9).toFixed(2),
          nonCirculating: (supply.value.nonCirculating / 1e9).toFixed(2),
          activeStake: (totalStake / 1e9).toFixed(2),
          stakePercentage: ((totalStake / supply.value.circulating) * 100).toFixed(2),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
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
