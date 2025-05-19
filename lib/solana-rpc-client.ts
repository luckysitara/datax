import axios from "axios"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// === CONFIG ===
const HELIUS_API_KEY = process.env.SOLANA_RPC_URL?.includes("api-key=")
  ? process.env.SOLANA_RPC_URL.split("api-key=")[1]
  : "48be5c95-03f2-4385-8e01-144e3d77ef4a"

const RPC_URL = process.env.SOLANA_RPC_URL || `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// === RPC HELPER ===
export async function rpcRequest(method: string, params: any[] = [], retries = 3) {
  let lastError

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await axios.post(
        RPC_URL,
        {
          jsonrpc: "2.0",
          id: Date.now(),
          method,
          params,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000, // 30 second timeout
        },
      )

      if (res.data.error) {
        throw new Error(`RPC Error: ${res.data.error.message}`)
      }

      return res.data.result
    } catch (err: any) {
      lastError = err
      console.warn(`Attempt ${attempt + 1}/${retries} failed for ${method}: ${err.message}`)

      // If rate limited, wait longer before retry
      const backoff = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }

  throw lastError
}

// === FETCH VALIDATORS ===
export async function fetchValidators() {
  console.log("🔍 Fetching validators...")
  const { current, delinquent } = await rpcRequest("getVoteAccounts", [])

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

  return [...current.map((v: any) => format(v, false)), ...delinquent.map((v: any) => format(v, true))]
}

// === FETCH INFLATION REWARDS (with safe fallback epoch) ===
export async function fetchInflationRewards(pubkeys: string[]) {
  console.log("💰 Fetching inflation rewards...")
  const BATCH = 100
  let rewards: any[] = []
  const currentEpoch = (await rpcRequest("getEpochInfo", [])).epoch
  let fetched = false

  for (let offset = 1; offset <= 5 && !fetched; offset++) {
    try {
      console.log(`➡️ Trying rewards for epoch ${currentEpoch - offset}`)
      for (let i = 0; i < pubkeys.length; i += BATCH) {
        const chunk = pubkeys.slice(i, i + BATCH)
        const result = await rpcRequest("getInflationReward", [chunk, { epoch: currentEpoch - offset }])
        rewards.push(...(result || []))

        // Add a small delay between batches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200))
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
  const BATCH = 50 // Smaller batch size to avoid rate limiting
  const results: any[] = []

  for (let i = 0; i < pubkeys.length; i += BATCH) {
    const chunk = pubkeys.slice(i, i + BATCH)
    try {
      const res = await rpcRequest("getMultipleAccounts", [chunk, { encoding: "base64" }])
      results.push(...res.value)

      // Add a small delay between batches to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (err) {
      console.error(`Error fetching accounts ${i} to ${i + BATCH}: ${(err as Error).message}`)
      // Add nulls for the failed batch
      results.push(...Array(chunk.length).fill(null))
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

// === FETCH PERFORMANCE SAMPLES ===
export async function fetchPerformanceSamples(limit = 5) {
  console.log("📊 Fetching performance samples...")
  return await rpcRequest("getRecentPerformanceSamples", [limit])
}

// === FETCH BLOCK PRODUCTION ===
export async function fetchBlockProduction(identityPubkey: string) {
  console.log(`📦 Fetching block production for ${identityPubkey}...`)
  const res = await rpcRequest("getBlockProduction", [{ identity: identityPubkey }])
  return res.value
}

// === FETCH RECENT BLOCKS ===
export async function fetchRecentBlocks(limit = 10) {
  console.log("🧱 Fetching recent blocks...")
  const currentSlot = await rpcRequest("getSlot", [])
  const blocks = []

  for (let i = 0; i < limit; i++) {
    try {
      const slot = currentSlot - i
      const blockTime = await rpcRequest("getBlockTime", [slot])
      const blockInfo = await rpcRequest("getBlock", [slot, { maxSupportedTransactionVersion: 0 }])

      let validator = "Unknown"
      if (blockInfo?.rewards && blockInfo.rewards.length > 0) {
        const blockLeader = blockInfo.rewards.find((r: any) => r.rewardType === "Fee")
        if (blockLeader) {
          validator = blockLeader.pubkey
        }
      }

      blocks.push({
        slot,
        blockTime,
        blockHeight: blockInfo?.blockHeight || slot,
        validator,
        transactions: blockInfo?.transactions?.length || 0,
        totalFees: blockInfo?.transactions?.reduce((sum: number, tx: any) => sum + (tx.meta?.fee || 0), 0) / 1e9 || 0,
      })

      // Add a small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (err) {
      console.error(`Error fetching block at slot ${currentSlot - i}: ${(err as Error).message}`)
    }
  }

  return blocks
}

// === FETCH RECENT TRANSACTIONS ===
export async function fetchRecentTransactions(limit = 20) {
  console.log("💸 Fetching recent transactions...")
  // Get a popular account to fetch transactions from
  const transactions = []

  try {
    // Use Solana's main system program as a source of transactions
    const systemProgram = "11111111111111111111111111111111"
    const signatures = await rpcRequest("getSignaturesForAddress", [systemProgram, { limit }])

    for (const sig of signatures.slice(0, limit)) {
      try {
        const tx = await rpcRequest("getTransaction", [sig.signature, { maxSupportedTransactionVersion: 0 }])
        if (tx) {
          transactions.push({
            signature: sig.signature,
            blockTime: tx.blockTime,
            slot: tx.slot,
            fee: tx.meta.fee / 1e9,
            status: tx.meta.err ? "Failed" : "Success",
          })
        }

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (err) {
        console.error(`Error fetching transaction ${sig.signature}: ${(err as Error).message}`)
      }
    }
  } catch (err) {
    console.error(`Error fetching transaction signatures: ${(err as Error).message}`)
  }

  return transactions
}

// === STORE DATA IN SUPABASE ===
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
      name: v.info?.name || null,
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

// Store validator metrics
export async function storeValidatorMetrics(validators: any[], epoch: number) {
  console.log(`📊 Storing metrics for ${validators.length} validators...`)

  const BATCH_SIZE = 50
  let successCount = 0

  for (let i = 0; i < validators.length; i += BATCH_SIZE) {
    const batch = validators.slice(i, i + BATCH_SIZE)

    const metricRecords = batch.map((v) => ({
      vote_pubkey: v.votePubkey,
      epoch: epoch,
      slot: v.lastVote || 0,
      activated_stake: v.activatedStake,
      credits: v.epochCredits?.[0]?.[1] || 0,
      rewards: v.inflationReward?.amount || 0,
      timestamp: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from("validator_metrics")
      .upsert(metricRecords, { onConflict: "vote_pubkey, epoch" })

    if (error) {
      console.error("Error storing validator metrics:", error)
    } else {
      successCount += batch.length
    }
  }

  console.log(`✅ Successfully stored metrics for ${successCount} validators`)
  return { count: successCount }
}

// Store blocks
export async function storeBlocks(blocks: any[]) {
  console.log(`🧱 Storing ${blocks.length} blocks...`)

  const blockRecords = blocks.map((block) => ({
    slot: block.slot,
    block_time: new Date(block.blockTime * 1000).toISOString(),
    block_height: block.blockHeight,
    leader: block.validator,
    transactions: block.transactions,
    fees: block.totalFees,
    created_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from("blocks").upsert(blockRecords, { onConflict: "slot" })

  if (error) {
    console.error("Error storing blocks:", error)
    return { count: 0 }
  }

  return { count: blocks.length }
}

// Store transactions
export async function storeTransactions(transactions: any[]) {
  console.log(`💸 Storing ${transactions.length} transactions...`)

  const txRecords = transactions.map((tx) => ({
    signature: tx.signature,
    block_time: new Date(tx.blockTime * 1000).toISOString(),
    slot: tx.slot,
    fee: tx.fee,
    status: tx.status,
    created_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from("transactions").upsert(txRecords, { onConflict: "signature" })

  if (error) {
    console.error("Error storing transactions:", error)
    return { count: 0 }
  }

  return { count: transactions.length }
}

// Create necessary tables
async function createTables() {
  // Check if validators table exists
  const { data: existingTables } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")

  const validatorsTableExists = existingTables?.some((t) => t.table_name === "validators")

  if (!validatorsTableExists) {
    console.log("Creating database tables...")

    // Execute the SQL from db-setup.sql
    const { error } = await supabase.rpc("setup_database_tables")

    if (error) {
      console.error("Error creating tables:", error)
      throw new Error(`Failed to create database tables: ${error.message}`)
    }
  }
}

// === MAIN FUNCTION ===
export async function fetchAndStoreAllData() {
  try {
    console.log("🚀 Starting data fetch...")

    // Fetch validators
    const validators = await fetchValidators()
    console.log(`✅ Fetched ${validators.length} validators`)

    // Fetch current epoch
    const epochInfo = await rpcRequest("getEpochInfo", [])
    const currentEpoch = epochInfo.epoch
    console.log(`📆 Current epoch: ${currentEpoch}`)

    // Fetch inflation rewards
    const votePubkeys = validators.map((v: any) => v.votePubkey)
    const rewards = await fetchInflationRewards(votePubkeys)
    validators.forEach((v: any, i: number) => (v.inflationReward = rewards[i] || null))

    // Fetch account infos
    const identityPubkeys = validators.map((v: any) => v.identityPubkey)
    const accountInfos = await fetchAccountInfos(identityPubkeys)

    // Parse validator info
    validators.forEach((v: any, i: number) => {
      v.accountInfo = accountInfos[i] || null
      v.info = parseValidatorInfo(accountInfos[i])
    })

    // Fetch performance samples
    const perfSamples = await fetchPerformanceSamples(5)

    // Fetch recent blocks
    const blocks = await fetchRecentBlocks(20)

    // Fetch recent transactions
    const transactions = await fetchRecentTransactions(50)

    // Store data in database
    await storeValidatorsInDatabase(validators)
    await storeValidatorMetrics(validators, currentEpoch)
    await storeBlocks(blocks)
    await storeTransactions(transactions)

    return {
      success: true,
      epoch: currentEpoch,
      totalValidators: validators.length,
      blocks: blocks.length,
      transactions: transactions.length,
    }
  } catch (error) {
    console.error("❌ Error fetching and storing data:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Export functions that match the original solana-rpc.ts API
export async function getCurrentSlot() {
  try {
    const result = await rpcRequest("getSlot", [])
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getEpochInfo() {
  try {
    const result = await rpcRequest("getEpochInfo", [])
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getVoteAccounts() {
  try {
    const result = await rpcRequest("getVoteAccounts", [])
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getSignaturesForAddress(address: string, limit = 10) {
  try {
    const result = await rpcRequest("getSignaturesForAddress", [address, { limit }])
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getBlockTime(slot: number) {
  try {
    const result = await rpcRequest("getBlockTime", [slot])
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getAccountInfo(pubkey: string, encoding = "base64") {
  try {
    const result = await rpcRequest("getAccountInfo", [pubkey, { encoding }])
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
