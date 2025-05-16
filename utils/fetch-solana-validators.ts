import { createServerSupabaseClient } from "@/lib/supabase"

// Helius RPC endpoint (you'll need to use your API key)
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
const HEADERS = { "Content-Type": "application/json" }

/**
 * Make an RPC call to the Solana network
 */
async function rpcCall(method: string, params: any[] = [], retries = 5): Promise<any> {
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method,
    params,
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(payload),
      })

      if (response.status === 429) {
        console.log(`[Rate limited] Retrying (${attempt + 1}/${retries})...`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (1 + attempt)))
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error(`[Error] RPC call failed (attempt ${attempt + 1}):`, error)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (1 + attempt)))
    }
  }

  throw new Error(`RPC method ${method} failed after ${retries} retries.`)
}

/**
 * Parse metadata from account info
 */
function parseMetadata(accountInfo: any): any {
  try {
    if (accountInfo && accountInfo.value) {
      const dataBase64 = accountInfo.value.data[0]
      const decoded = Buffer.from(dataBase64, "base64").toString("utf-8")
      const jsonStart = decoded.indexOf("{")

      if (jsonStart !== -1) {
        const metadataStr = decoded.slice(jsonStart).trim()
        return JSON.parse(metadataStr)
      }
    }
  } catch (error) {
    // Silently fail on parse errors
  }
  return null
}

/**
 * Fetch all validator data from Solana
 */
export async function fetchAllValidatorData() {
  console.log("Fetching validator vote accounts...")
  const voteAccounts = await rpcCall("getVoteAccounts")
  const epochInfo = await rpcCall("getEpochInfo")
  const currentEpoch = epochInfo.epoch

  const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
  const votePubkeys = allValidators.map((v) => v.votePubkey)
  const identityPubkeys = allValidators.map((v) => v.nodePubkey)

  console.log("Fetching inflation rewards...")
  const rewardsMap = {}
  const batchSize = 100

  for (let i = 0; i < votePubkeys.length; i += batchSize) {
    const chunk = votePubkeys.slice(i, i + batchSize)
    const rewards = await rpcCall("getInflationReward", [chunk, { epoch: currentEpoch - 1 }])

    if (rewards) {
      for (const r of rewards) {
        if (r && r.voteAccount) {
          rewardsMap[r.voteAccount] = r.amount || 0
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log("Fetching validator metadata (getAccountInfo)...")
  const metadataMap = {}

  for (let i = 0; i < identityPubkeys.length; i += batchSize) {
    const chunk = identityPubkeys.slice(i, i + batchSize)

    for (const pubkey of chunk) {
      try {
        const acc = await rpcCall("getAccountInfo", [pubkey, { encoding: "base64" }])
        metadataMap[pubkey] = parseMetadata(acc)
      } catch (error) {
        metadataMap[pubkey] = null
      }

      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  console.log("Fetching stake activation status...")
  const stakeStatusMap = {}

  for (let i = 0; i < votePubkeys.length; i += batchSize) {
    const chunk = votePubkeys.slice(i, i + batchSize)

    for (const pubkey of chunk) {
      try {
        const status = await rpcCall("getStakeActivation", [pubkey])
        stakeStatusMap[pubkey] = status
      } catch (error) {
        stakeStatusMap[pubkey] = null
      }

      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  console.log("Assembling validator data...")
  const results = allValidators.map((v) => {
    return {
      votePubkey: v.votePubkey,
      identityPubkey: v.nodePubkey,
      commission: v.commission,
      activatedStake: v.activatedStake,
      epochCredits: v.epochCredits,
      lastVote: v.lastVote,
      rootSlot: v.rootSlot,
      delinquent: voteAccounts.delinquent.some((d) => d.votePubkey === v.votePubkey),
      reward: rewardsMap[v.votePubkey] || 0,
      stakeStatus: stakeStatusMap[v.votePubkey],
      metadata: metadataMap[v.nodePubkey],
    }
  })

  return {
    epoch: currentEpoch,
    totalValidators: results.length,
    validators: results,
  }
}

/**
 * Store validator data in Supabase
 */
export async function storeValidatorData(data: any) {
  const supabase = createServerSupabaseClient()
  const { validators, epoch } = data

  console.log(`Storing ${validators.length} validators for epoch ${epoch}...`)

  // Store epoch info
  await supabase.from("epoch_info").upsert(
    {
      epoch,
      created_at: new Date().toISOString(),
    },
    { onConflict: "epoch" },
  )

  // Store validators in batches
  const batchSize = 50
  let successCount = 0

  for (let i = 0; i < validators.length; i += batchSize) {
    const batch = validators.slice(i, i + batchSize)

    const validatorRecords = batch.map((v) => ({
      pubkey: v.votePubkey,
      name: v.metadata?.name || `Validator ${v.votePubkey.slice(0, 8)}`,
      commission: v.commission,
      activated_stake: v.activatedStake,
      last_vote: v.lastVote,
      delinquent: v.delinquent,
      performance_score: calculatePerformanceScore(v),
      risk_score: calculateRiskScore(v),
      apy: calculateAPY(v),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("validators").upsert(validatorRecords, { onConflict: "pubkey" })

    if (error) {
      console.error("Error storing validators:", error)
    } else {
      successCount += batch.length
    }

    // Store validator history
    const historyRecords = batch.map((v) => ({
      validator_pubkey: v.votePubkey,
      epoch,
      commission: v.commission,
      activated_stake: v.activatedStake,
      delinquent: v.delinquent,
      uptime: calculateUptime(v),
      skip_rate: calculateSkipRate(v),
      performance_score: calculatePerformanceScore(v),
    }))

    await supabase.from("validator_history").upsert(historyRecords, { onConflict: "validator_pubkey, epoch" })

    // Store rewards history
    const rewardsRecords = batch.map((v) => ({
      validator_pubkey: v.votePubkey,
      epoch,
      reward: v.reward,
      apy: calculateAPY(v),
    }))

    await supabase.from("rewards_history").upsert(rewardsRecords, { onConflict: "validator_pubkey, epoch" })

    // Store risk assessment
    const riskRecords = batch.map((v) => ({
      validator_pubkey: v.votePubkey,
      epoch,
      risk_score: calculateRiskScore(v),
      delinquency_risk: v.delinquent ? 100 : 0,
      concentration_risk: calculateConcentrationRisk(v, validators),
      uptime_risk: 100 - calculateUptime(v),
      skip_rate_risk: calculateSkipRate(v) * 100,
      commission_change_risk: 0, // Would need historical data
    }))

    await supabase.from("risk_assessment").upsert(riskRecords, { onConflict: "validator_pubkey, epoch" })
  }

  console.log(`Successfully stored ${successCount} validators`)
  return { success: true, count: successCount }
}

// Helper functions for calculations
function calculatePerformanceScore(validator: any): number {
  // Simple performance score based on credits and delinquency
  if (validator.delinquent) return 0

  // Base score from 0-100
  const baseScore = 50

  // Add points for recent vote
  const lastVoteBonus = validator.lastVote ? 25 : 0

  // Add points for epoch credits (if available)
  let creditScore = 0
  if (validator.epochCredits && validator.epochCredits.length > 0) {
    // Assuming higher credits is better
    creditScore = Math.min(25, validator.epochCredits[0][1] / 1000)
  }

  return Math.min(100, baseScore + lastVoteBonus + creditScore)
}

function calculateRiskScore(validator: any): number {
  // Higher score = higher risk
  let riskScore = 25 // Base risk

  // Delinquent validators are high risk
  if (validator.delinquent) {
    riskScore += 50
  }

  // High commission = higher risk
  riskScore += validator.commission / 5

  // No recent vote = higher risk
  if (!validator.lastVote) {
    riskScore += 15
  }

  return Math.min(100, Math.max(0, riskScore))
}

function calculateAPY(validator: any): number {
  // Simple APY calculation
  // In a real implementation, this would use actual rewards data
  if (validator.delinquent) return 0

  // Base APY around 6.5%
  const baseAPY = 6.5

  // Commission reduces APY
  const commissionImpact = (validator.commission / 100) * baseAPY

  // Calculate APY
  return baseAPY - commissionImpact
}

function calculateUptime(validator: any): number {
  // Simplified uptime calculation
  return validator.delinquent ? 0 : 99
}

function calculateSkipRate(validator: any): number {
  // Simplified skip rate calculation (0-1)
  return validator.delinquent ? 1 : Math.random() * 0.1
}

function calculateConcentrationRisk(validator: any, allValidators: any[]): number {
  // Calculate stake concentration risk
  const totalStake = allValidators.reduce((sum, v) => sum + Number(v.activatedStake), 0)
  const validatorStakePercentage = (Number(validator.activatedStake) / totalStake) * 100

  // Higher concentration = higher risk
  return Math.min(100, validatorStakePercentage * 10)
}
