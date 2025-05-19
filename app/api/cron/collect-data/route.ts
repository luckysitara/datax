import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as solanaRpc from "@/lib/solana-rpc"

export async function POST() {
  try {
    console.log("Starting scheduled data collection...")
    const supabase = createServerSupabaseClient()

    // Fetch data from Solana RPC
    const [currentSlot, epochInfo, voteAccounts, supplyInfo, tps, blocks, transactions] = await Promise.all([
      solanaRpc.getCurrentSlot(),
      solanaRpc.getEpochInfo(),
      solanaRpc.getVoteAccounts(),
      solanaRpc.getSupplyInfo(),
      solanaRpc.getCurrentTPS(),
      solanaRpc.getRecentBlocks(10),
      solanaRpc.getRecentTransactions(50),
    ])

    // Process validators
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
    const activeStake = allValidators.reduce((sum, validator) => sum + Number(validator.activatedStake), 0)

    // Store network stats
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

    const { error: networkError } = await supabase.from("network_stats").insert(networkStats)

    if (networkError) {
      console.error("Error storing network stats:", networkError)
    }

    // Store epoch info
    const { error: epochError } = await supabase.from("epoch_info").upsert({
      epoch: epochInfo.epoch,
      slot: epochInfo.absoluteSlot,
      slots_in_epoch: epochInfo.slotsInEpoch,
      absolute_slot: epochInfo.absoluteSlot,
      block_height: null, // Would need to fetch from a block
      transaction_count: null, // Would need to calculate
      created_at: new Date().toISOString(),
    })

    if (epochError) {
      console.error("Error storing epoch info:", epochError)
    }

    // Process and store validators
    let validatorsProcessed = 0

    for (const validator of allValidators) {
      try {
        const isDelinquent = voteAccounts.delinquent.some((v) => v.votePubkey === validator.votePubkey)

        // Calculate performance score
        let performanceScore = 80 // Base score

        if (isDelinquent) {
          performanceScore = 50 // Lower score for delinquent validators
        } else {
          // Adjust based on last vote (more recent = better)
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

        // Calculate risk score
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

        // Calculate APY
        const baseAPY = 6.5
        const commissionImpact = (validator.commission / 100) * baseAPY
        const apy = baseAPY - commissionImpact

        // Store validator in database
        const { error: validatorError } = await supabase.from("validators").upsert(
          {
            pubkey: validator.nodePubkey,
            vote_pubkey: validator.votePubkey,
            name: `Validator ${validator.votePubkey.substring(0, 8)}`,
            commission: validator.commission,
            activated_stake: validator.activatedStake,
            last_vote: validator.lastVote,
            delinquent: isDelinquent,
            performance_score: performanceScore,
            risk_score: riskScore,
            apy,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "pubkey" },
        )

        if (validatorError) {
          console.error(`Error storing validator ${validator.votePubkey}:`, validatorError)
          continue
        }

        // Store validator history
        const { error: historyError } = await supabase.from("validator_history").insert({
          time: new Date().toISOString(),
          validator_pubkey: validator.nodePubkey,
          epoch: epochInfo.epoch,
          commission: validator.commission,
          activated_stake: validator.activatedStake,
          delinquent: isDelinquent,
          uptime: null, // Would need to calculate
          skip_rate: null, // Would need to calculate
          performance_score: performanceScore,
        })

        if (historyError) {
          console.error(`Error storing history for validator ${validator.votePubkey}:`, historyError)
          continue
        }

        // Store risk assessment
        const { error: riskError } = await supabase.from("risk_assessments").insert({
          time: new Date().toISOString(),
          validator_pubkey: validator.nodePubkey,
          epoch: epochInfo.epoch,
          risk_score: riskScore,
          delinquency_risk: isDelinquent ? 80 : 10,
          concentration_risk: validator.activatedStake > 500_000_000_000 ? 60 : 20,
          uptime_risk: null,
          skip_rate_risk: null,
          commission_change_risk: null,
        })

        if (riskError) {
          console.error(`Error storing risk assessment for validator ${validator.votePubkey}:`, riskError)
          continue
        }

        // Store rewards history (simulated)
        const { error: rewardsError } = await supabase.from("rewards_history").insert({
          time: new Date().toISOString(),
          validator_pubkey: validator.nodePubkey,
          epoch: epochInfo.epoch,
          reward: null, // Would need real data
          apy,
        })

        if (rewardsError) {
          console.error(`Error storing rewards for validator ${validator.votePubkey}:`, rewardsError)
          continue
        }

        validatorsProcessed++
      } catch (error) {
        console.error(`Error processing validator ${validator.votePubkey}:`, error)
      }
    }

    // Store blocks
    let blocksStored = 0

    for (const block of blocks) {
      try {
        const { error: blockError } = await supabase.from("blocks").insert({
          time: block.blockTime || new Date().toISOString(),
          slot: block.slot,
          block_height: block.blockHeight,
          leader: block.leader,
          transactions: block.transactions,
          fees: block.fees,
        })

        if (blockError) {
          console.error(`Error storing block ${block.slot}:`, blockError)
          continue
        }

        blocksStored++
      } catch (error) {
        console.error(`Error processing block ${block.slot}:`, error)
      }
    }

    // Store transactions
    let transactionsStored = 0

    for (const tx of transactions) {
      try {
        const { error: txError } = await supabase.from("transactions").insert({
          signature: tx.signature,
          block_time: tx.blockTime,
          slot: tx.slot,
          fee: tx.fee,
          status: tx.status,
          instruction_type: tx.instructionType,
        })

        if (txError) {
          // Ignore duplicate key errors
          if (!txError.message.includes("duplicate key")) {
            console.error(`Error storing transaction ${tx.signature}:`, txError)
          }
          continue
        }

        transactionsStored++
      } catch (error) {
        console.error(`Error processing transaction ${tx.signature}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data collection completed",
      stats: {
        validatorsProcessed,
        blocksStored,
        transactionsStored,
      },
    })
  } catch (error) {
    console.error("Error in scheduled data collection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to collect data",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
