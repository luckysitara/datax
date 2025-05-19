import { createClient } from "@supabase/supabase-js"
import * as solanaRpc from "@/lib/solana-rpc"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// === FETCH VALIDATORS ===
export async function fetchValidators() {
  console.log("🔍 Fetching validators...")
  const voteAccountsResult = await solanaRpc.getVoteAccounts()

  if (!voteAccountsResult.success) {
    throw new Error(`Failed to fetch vote accounts: ${voteAccountsResult.error}`)
  }

  const voteAccounts = voteAccountsResult.data

  const format = (v: any, delinquent: boolean) => ({
    votePubkey: v.votePubkey,
    identityPubkey: v.nodePubkey,
    activatedStake: v.activatedStake,
    commission: v.commission,
    lastVote: v.lastVote,
    epochCredits: v.epochCredits,
    rootSlot: v.rootSlot || null,
    isEpochVoteAccount: v.epochVoteAccount,
    delinquent,
  })

  return [
    ...voteAccounts.current.map((v: any) => format(v, false)),
    ...voteAccounts.delinquent.map((v: any) => format(v, true)),
  ]
}

// === FETCH INFLATION REWARDS (with safe fallback epoch) ===
export async function fetchInflationRewards(pubkeys: string[]) {
  console.log("💰 Fetching inflation rewards...")
  const BATCH = 50 // Smaller batch size to avoid rate limiting
  let rewards: any[] = []

  const epochInfoResult = await solanaRpc.getEpochInfo()
  if (!epochInfoResult.success) {
    throw new Error(`Failed to fetch epoch info: ${epochInfoResult.error}`)
  }

  const currentEpoch = epochInfoResult.data.epoch
  let fetched = false

  for (let offset = 1; offset <= 5 && !fetched; offset++) {
    try {
      console.log(`➡️ Trying rewards for epoch ${currentEpoch - offset}`)
      for (let i = 0; i < pubkeys.length; i += BATCH) {
        const chunk = pubkeys.slice(i, i + BATCH)
        const result = await solanaRpc.getInflationReward(chunk, currentEpoch - offset)

        if (result.success && result.data) {
          rewards.push(...(result.data || []))
        }

        // Add a delay between batches to avoid rate limiting
        if (i + BATCH < pubkeys.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
      fetched = true
    } catch (err) {
      console.warn(`⚠️ Failed for epoch ${currentEpoch - offset}: ${(err as Error).message}`)
      rewards = []
    }
  }
  return rewards
}

// === FETCH ACCOUNT INFO ===
export async function fetchAccountInfos(pubkeys: string[]) {
  console.log("📜 Fetching account infos...")
  const BATCH = 10 // Much smaller batch size to avoid rate limiting
  const results: any[] = []

  for (let i = 0; i < pubkeys.length; i += BATCH) {
    console.log(`Fetching account infos batch ${i / BATCH + 1}/${Math.ceil(pubkeys.length / BATCH)}`)
    const chunk = pubkeys.slice(i, i + BATCH)
    const batchResults = []

    for (const pubkey of chunk) {
      try {
        // Check cache first
        const { data: cachedInfo } = await supabase
          .from("validator_info_cache")
          .select("*")
          .eq("pubkey", pubkey)
          .single()

        if (cachedInfo && cachedInfo.data) {
          batchResults.push(cachedInfo.data)
          continue
        }

        // If not in cache, fetch from RPC
        const result = await solanaRpc.getAccountInfo(pubkey)
        if (result.success) {
          batchResults.push(result.data)

          // Cache the result
          await supabase.from("validator_info_cache").upsert(
            {
              pubkey,
              data: result.data,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "pubkey" },
          )
        } else {
          batchResults.push(null)
        }

        // Add a small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Error fetching account info for ${pubkey}:`, error)
        batchResults.push(null)
      }
    }

    results.push(...batchResults)

    // Add a longer delay between batches
    if (i + BATCH < pubkeys.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  return results
}

// === PARSE VALIDATOR INFO ===
export function parseValidatorInfo(accountInfo: any) {
  try {
    if (!accountInfo || !accountInfo.data || !accountInfo.data[0]) {
      return null
    }

    const data = Buffer.from(accountInfo.data[0], "base64")

    // Find the JSON part of the data
    let jsonStart = -1
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 123 && data[i + 1] !== 0) {
        // '{' character
        jsonStart = i
        break
      }
    }

    if (jsonStart === -1) {
      return null
    }

    const jsonData = data.slice(jsonStart).toString("utf8")

    // Find the end of the JSON object
    let bracketCount = 0
    let endPos = 0

    for (let i = 0; i < jsonData.length; i++) {
      if (jsonData[i] === "{") bracketCount++
      if (jsonData[i] === "}") bracketCount--

      if (bracketCount === 0 && i > 0) {
        endPos = i + 1
        break
      }
    }

    const jsonStr = jsonData.substring(0, endPos)

    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      return null
    }
  } catch (error) {
    console.error("Error parsing validator info:", error)
    return null
  }
}

// === STORE VALIDATORS IN DATABASE ===
export async function storeValidatorsInDatabase(validators: any[]) {
  console.log(`📝 Storing ${validators.length} validators in database...`)

  // Create tables if they don't exist
  await createTables()

  // Store validators in batches
  const BATCH_SIZE = 50
  let successCount = 0

  for (let i = 0; i < validators.length; i += BATCH_SIZE) {
    const batch = validators.slice(i, i + BATCH_SIZE)

    const validatorRecords = batch.map((v) => ({
      vote_pubkey: v.votePubkey,
      identity_pubkey: v.identityPubkey,
      name: v.info?.name || `Validator ${v.votePubkey.slice(0, 8)}`,
      website: v.info?.website || null,
      commission: v.commission,
      activated_stake: v.activatedStake,
      last_vote: v.lastVote,
      delinquent: v.delinquent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("validators").upsert(validatorRecords, { onConflict: "vote_pubkey" })

    if (error) {
      console.error("Error storing validators:", error)
    } else {
      successCount += batch.length
    }
  }

  console.log(`✅ Successfully stored ${successCount} validators`)
  return { count: successCount }
}

// === CREATE DATABASE TABLES ===
async function createTables() {
  // Check if validators table exists
  const { data: existingTables } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")

  const tableExists = existingTables?.some((t) => t.table_name === "validators")

  if (!tableExists) {
    console.log("Creating database tables...")

    // Create validators table
    await supabase.rpc("create_validators_table")

    // Create other necessary tables
    await supabase.rpc("create_validator_history_table")
    await supabase.rpc("create_rewards_history_table")
    await supabase.rpc("create_risk_assessment_table")
    await supabase.rpc("create_rpc_cache_table")
    await supabase.rpc("create_validator_info_cache_table")
  }
}

// === HELPER FUNCTIONS ===
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

// === MAIN FUNCTION ===
export async function fetchAndStoreValidatorData() {
  try {
    // Fetch validators
    const validators = await fetchValidators()
    console.log(`✅ Fetched ${validators.length} validators`)

    // Fetch current epoch
    const epochInfoResult = await solanaRpc.getEpochInfo()
    if (!epochInfoResult.success) {
      throw new Error(`Failed to fetch epoch info: ${epochInfoResult.error}`)
    }
    const currentEpoch = epochInfoResult.data.epoch

    // Process validators in smaller batches to avoid rate limiting
    const BATCH_SIZE = 50
    for (let i = 0; i < validators.length; i += BATCH_SIZE) {
      console.log(`Processing validators batch ${i / BATCH_SIZE + 1}/${Math.ceil(validators.length / BATCH_SIZE)}`)
      const batch = validators.slice(i, i + BATCH_SIZE)

      // Fetch inflation rewards for this batch
      const votePubkeys = batch.map((v: any) => v.votePubkey)
      const rewards = await fetchInflationRewards(votePubkeys)

      // Fetch account infos for this batch
      const identityPubkeys = batch.map((v: any) => v.identityPubkey)
      const accountInfos = await fetchAccountInfos(identityPubkeys)

      // Process validator data
      for (let j = 0; j < batch.length; j++) {
        batch[j].reward = rewards[j] || null
        batch[j].accountInfo = accountInfos[j] || null
        batch[j].info = parseValidatorInfo(accountInfos[j])
      }

      // Store this batch in database
      await storeValidatorsInDatabase(batch)

      // Add a delay between batches
      if (i + BATCH_SIZE < validators.length) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }

    return {
      success: true,
      epoch: currentEpoch,
      totalValidators: validators.length,
      storedValidators: validators.length,
    }
  } catch (error) {
    console.error("❌ Error fetching and storing validator data:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}
