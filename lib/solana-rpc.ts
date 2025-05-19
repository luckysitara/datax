import { Connection } from "@solana/web3.js"
import { createServerSupabaseClient } from "./supabase"

// Cache durations in seconds
const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
}

// Initialize Solana connection
export function getSolanaConnection() {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL
    if (!rpcUrl) {
      throw new Error("SOLANA_RPC_URL environment variable is not set")
    }
    return new Connection(rpcUrl, "confirmed")
  } catch (error) {
    console.error("Error creating Solana connection:", error)
    throw error
  }
}

// Helper function to cache RPC responses
async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  duration: number = CACHE_DURATIONS.MEDIUM,
): Promise<T> {
  try {
    const supabase = createServerSupabaseClient()

    // Try to get from cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from("rpc_cache")
      .select("data, expires_at")
      .eq("cache_key", cacheKey)
      .single()

    // If we have valid cached data, return it
    if (!cacheError && cachedData && new Date(cachedData.expires_at) > new Date()) {
      return cachedData.data as T
    }

    // Otherwise fetch fresh data
    const result = await fetchFn()

    // Store in cache
    const expiresAt = new Date(Date.now() + duration * 1000).toISOString()
    await supabase.from("rpc_cache").upsert({
      cache_key: cacheKey,
      data: result as any,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })

    return result
  } catch (error) {
    console.error(`Error in withCache for key ${cacheKey}:`, error)
    throw error
  }
}

// Get current slot
export async function getCurrentSlot() {
  try {
    const connection = getSolanaConnection()
    const slot = await connection.getSlot()
    return { success: true, data: slot }
  } catch (error) {
    console.error("Error getting current slot:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get epoch info
export async function getEpochInfo() {
  try {
    const connection = getSolanaConnection()
    const epochInfo = await connection.getEpochInfo()
    return { success: true, data: epochInfo }
  } catch (error) {
    console.error("Error getting epoch info:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get vote accounts (validators)
export async function getVoteAccounts() {
  try {
    const connection = getSolanaConnection()
    const voteAccounts = await connection.getVoteAccounts()
    return { success: true, data: voteAccounts }
  } catch (error) {
    console.error("Error getting vote accounts:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get validator info
export async function getValidatorInfo(pubkey: string) {
  try {
    const connection = getSolanaConnection()
    const voteAccounts = await connection.getVoteAccounts()
    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
    const validator = allValidators.find((v) => v.votePubkey === pubkey || v.nodePubkey === pubkey)
    return { success: true, data: validator }
  } catch (error) {
    console.error(`Error getting validator info for ${pubkey}:`, error)
    return { success: false, error: (error as Error).message }
  }
}

// Get recent blocks
export async function getRecentBlocks(limit = 10) {
  try {
    const connection = getSolanaConnection()
    const slot = await connection.getSlot()

    // Get blocks from slot-limit to slot
    const blocks = []
    for (let i = 0; i < limit; i++) {
      const blockSlot = slot - i
      if (blockSlot < 0) break

      try {
        const block = await connection.getBlock(blockSlot, {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        })

        if (block) {
          blocks.push({
            slot: blockSlot,
            blockTime: block.blockTime,
            blockHeight: block.blockHeight,
            transactions: block.transactions?.length || 0,
            leader: block.rewards?.[0]?.pubkey || null,
            fees: block.transactions?.reduce((sum, tx) => sum + (tx.meta?.fee || 0), 0) || 0,
          })
        }
      } catch (blockError) {
        console.error(`Error getting block at slot ${blockSlot}:`, blockError)
        // Continue with next block
      }
    }

    return { success: true, data: blocks }
  } catch (error) {
    console.error("Error getting recent blocks:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get recent transactions
export async function getRecentTransactions(limit = 20) {
  try {
    const connection = getSolanaConnection()
    const slot = await connection.getSlot()

    // Get a recent block
    const block = await connection.getBlock(slot - 2, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    })

    if (!block || !block.transactions) {
      throw new Error("No transactions found in recent block")
    }

    // Get transaction details
    const transactions = block.transactions.slice(0, limit).map((tx) => {
      return {
        signature: tx.transaction.signatures[0],
        blockTime: block.blockTime,
        slot: block.slot,
        fee: tx.meta?.fee || 0,
        status: tx.meta?.err ? "Failed" : "Success",
        instructionType: getInstructionType(tx),
      }
    })

    return { success: true, data: transactions }
  } catch (error) {
    console.error("Error getting recent transactions:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Helper to determine instruction type
function getInstructionType(transaction: any): string {
  try {
    // This is a simplified version - in a real implementation, you would
    // decode the instructions to determine their types
    const programIds = transaction.transaction.message.instructions.map((ix: any) => {
      const programIdIndex = ix.programIdIndex
      return transaction.transaction.message.accountKeys[programIdIndex].toString()
    })

    if (programIds.includes("11111111111111111111111111111111")) {
      return "System"
    } else if (programIds.includes("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")) {
      return "Token"
    } else if (programIds.includes("Stake11111111111111111111111111111111111111")) {
      return "Stake"
    } else if (programIds.includes("Vote111111111111111111111111111111111111111")) {
      return "Vote"
    } else {
      return "Other"
    }
  } catch (error) {
    return "Unknown"
  }
}

// Get supply info
export async function getSupplyInfo() {
  try {
    const connection = getSolanaConnection()
    const supply = await connection.getSupply()
    return { success: true, data: supply }
  } catch (error) {
    console.error("Error getting supply info:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Calculate current TPS
export async function getCurrentTPS() {
  try {
    const connection = getSolanaConnection()

    // Get performance samples
    const samples = await connection.getRecentPerformanceSamples(5)

    if (samples.length === 0) {
      return { success: true, data: 0 }
    }

    // Calculate average TPS from samples
    const totalTxs = samples.reduce((sum, sample) => sum + sample.numTransactions, 0)
    const totalSeconds = samples.reduce((sum, sample) => sum + sample.samplePeriodSecs, 0)

    const tps = totalSeconds > 0 ? totalTxs / totalSeconds : 0
    return { success: true, data: tps }
  } catch (error) {
    console.error("Error calculating TPS:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Store validator data in database
export async function storeValidatorsInDatabase(validators: any[]) {
  try {
    const supabase = createServerSupabaseClient()

    // Insert validators in batches to avoid request size limits
    const BATCH_SIZE = 100
    for (let i = 0; i < validators.length; i += BATCH_SIZE) {
      const batch = validators.slice(i, i + BATCH_SIZE)

      const { error } = await supabase.from("validators").upsert(batch, {
        onConflict: "pubkey",
      })

      if (error) {
        console.error(`Error upserting validators batch ${i}/${validators.length}:`, error)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error storing validators in database:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get validator data from database
export async function getValidatorsFromDatabase(
  options: {
    limit?: number
    offset?: number
    sort?: string
    order?: "asc" | "desc"
    filter?: string
    search?: string
  } = {},
) {
  try {
    const supabase = createServerSupabaseClient()

    const { limit = 50, offset = 0, sort = "activated_stake", order = "desc", filter = "all", search = "" } = options

    // Build query
    let query = supabase.from("validators").select("*", { count: "exact" })

    // Apply filters
    if (filter === "delinquent") {
      query = query.eq("delinquent", true)
    } else if (filter === "active") {
      query = query.eq("delinquent", false)
    } else if (filter === "top_performance") {
      query = query.gte("performance_score", 80)
    } else if (filter === "low_risk") {
      query = query.lte("risk_score", 30)
    }

    // Apply search
    if (search) {
      query = query.or(`name.ilike.%${search}%,pubkey.ilike.%${search}%`)
    }

    // Apply sorting
    if (sort && ["name", "commission", "activated_stake", "performance_score", "risk_score", "apy"].includes(sort)) {
      query = query.order(sort, { ascending: order === "asc" })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return { success: true, data, count }
  } catch (error) {
    console.error("Error getting validators from database:", error)
    return { success: false, error: (error as Error).message }
  }
}
