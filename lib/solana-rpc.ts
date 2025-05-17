import axios, { type AxiosInstance } from "axios"

// Only use Helius and Solana public RPC as requested
const RPC_ENDPOINTS = [
  {
    url: "https://mainnet.helius-rpc.com/?api-key=48be5c95-03f2-4385-8e01-144e3d77ef4a",
    weight: 10,
    name: "Helius",
  },
  {
    url: "https://api.mainnet-beta.solana.com",
    weight: 5,
    name: "Solana Mainnet",
  },
]

// Create axios instances for each endpoint with increased timeout
const axiosInstances: Record<string, AxiosInstance> = {}
RPC_ENDPOINTS.forEach((endpoint) => {
  axiosInstances[endpoint.name] = axios.create({
    baseURL: endpoint.url,
    timeout: 60000, // Increase timeout to 60 seconds
    headers: { "Content-Type": "application/json" },
  })
})

// Cache for RPC responses with longer TTL
const rpcCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 20 * 60 * 1000 // 20 minute cache to reduce API calls

// Rate limiting control
const endpointStatus: Record<
  string,
  {
    lastRequestTime: number
    consecutiveFailures: number
    isRateLimited: boolean
    rateLimitResetTime: number
    backoffTime: number
    requestsInWindow: number
    windowStartTime: number
  }
> = {}

// Initialize endpoint status
RPC_ENDPOINTS.forEach((endpoint) => {
  endpointStatus[endpoint.name] = {
    lastRequestTime: 0,
    consecutiveFailures: 0,
    isRateLimited: false,
    rateLimitResetTime: 0,
    backoffTime: 1000, // Start with 1 second backoff
    requestsInWindow: 0,
    windowStartTime: Date.now(),
  }
})

// Request queue to control flow
interface QueuedRequest {
  method: string
  params: any[]
  resolve: (value: any) => void
  reject: (reason: any) => void
  bypassCache: boolean
  priority: number
  timestamp: number
}

const requestQueue: QueuedRequest[] = []
let isProcessingQueue = false

// Constants for rate limiting
const MIN_REQUEST_INTERVAL = 2000 // 2 seconds between requests to the same endpoint
const MAX_BACKOFF_TIME = 300000 // 5 minutes maximum backoff
const RATE_LIMIT_BACKOFF = 300000 // 5 minutes backoff when rate limited
const MAX_REQUESTS_PER_WINDOW = 10 // Maximum requests per window
const WINDOW_SIZE = 60000 // 1 minute window

/**
 * Process the request queue
 */
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return

  isProcessingQueue = true

  try {
    // Sort queue by priority (higher first) and then by timestamp (older first)
    requestQueue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return a.timestamp - b.timestamp
    })

    const request = requestQueue.shift()
    if (!request) {
      isProcessingQueue = false
      return
    }

    try {
      const result = await executeRpcCall(request.method, request.params, request.bypassCache)
      request.resolve(result)
    } catch (error) {
      request.reject(error)
    }

    // Small delay before processing next request
    await new Promise((resolve) => setTimeout(resolve, 500))
  } finally {
    isProcessingQueue = false
    if (requestQueue.length > 0) {
      processQueue()
    }
  }
}

/**
 * Add a request to the queue
 */
function queueRpcCall(
  method: string,
  params: any[] = [],
  bypassCache = false,
  priority = 1,
): Promise<{ success: boolean; data?: any; error?: string; source?: string }> {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      method,
      params,
      resolve,
      reject,
      bypassCache,
      priority,
      timestamp: Date.now(),
    })

    if (!isProcessingQueue) {
      processQueue()
    }
  })
}

/**
 * Execute an RPC call with multiple endpoints and rate limiting
 */
async function executeRpcCall(
  method: string,
  params: any[] = [],
  bypassCache = false,
): Promise<{ success: boolean; data?: any; error?: string; source?: string }> {
  // Create a cache key based on the method and params
  const cacheKey = `${method}:${JSON.stringify(params)}`

  // Check cache first unless bypassing
  if (!bypassCache && rpcCache[cacheKey] && Date.now() - rpcCache[cacheKey].timestamp < CACHE_TTL) {
    console.log(`Using cached response for ${method}`)
    return { success: true, data: rpcCache[cacheKey].data, source: "cache" }
  }

  // Sort endpoints by weight and availability
  const availableEndpoints = RPC_ENDPOINTS.filter((endpoint) => {
    const status = endpointStatus[endpoint.name]
    return !status.isRateLimited || Date.now() > status.rateLimitResetTime
  }).sort((a, b) => {
    // Sort by weight (higher first)
    return b.weight - a.weight
  })

  if (availableEndpoints.length === 0) {
    console.log("All endpoints are rate limited, waiting for the first to become available")

    // Find the endpoint that will become available soonest
    const nextAvailableEndpoint = RPC_ENDPOINTS.reduce((earliest, current) => {
      const currentStatus = endpointStatus[current.name]
      const earliestStatus = endpointStatus[earliest.name]

      return currentStatus.rateLimitResetTime < earliestStatus.rateLimitResetTime ? current : earliest
    }, RPC_ENDPOINTS[0])

    const waitTime = Math.max(0, endpointStatus[nextAvailableEndpoint.name].rateLimitResetTime - Date.now())

    console.log(`Waiting ${waitTime}ms for ${nextAvailableEndpoint.name} to become available`)
    await new Promise((resolve) => setTimeout(resolve, waitTime + 100))

    // Try again after waiting
    return executeRpcCall(method, params, bypassCache)
  }

  // Try each endpoint until one works
  for (const endpoint of availableEndpoints) {
    const status = endpointStatus[endpoint.name]

    // Check if we've exceeded the rate limit for this window
    const now = Date.now()
    if (now - status.windowStartTime > WINDOW_SIZE) {
      // Reset window
      status.windowStartTime = now
      status.requestsInWindow = 0
    }

    if (status.requestsInWindow >= MAX_REQUESTS_PER_WINDOW) {
      console.log(`Rate limit exceeded for ${endpoint.name}, skipping`)
      status.isRateLimited = true
      status.rateLimitResetTime = now + RATE_LIMIT_BACKOFF
      continue
    }

    // Respect rate limiting by adding delay between requests
    const timeSinceLastRequest = now - status.lastRequestTime

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
    }

    try {
      status.lastRequestTime = Date.now()
      status.requestsInWindow++
      console.log(`Calling ${method} on ${endpoint.name}`)

      const response = await axiosInstances[endpoint.name].post("", {
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      })

      if (response.data && response.data.result !== undefined) {
        // Reset failure count on success
        status.consecutiveFailures = 0
        status.backoffTime = 1000
        status.isRateLimited = false

        // Cache the successful response
        rpcCache[cacheKey] = {
          data: response.data.result,
          timestamp: Date.now(),
        }

        return { success: true, data: response.data.result, source: endpoint.name }
      }

      // Check for rate limiting error
      if (
        response.data &&
        response.data.error &&
        (response.data.error.code === -32429 ||
          (response.data.error.message &&
            (response.data.error.message.includes("rate limit") ||
              response.data.error.message.includes("rate limited"))))
      ) {
        console.error(`Rate limited for method ${method} on ${endpoint.name}:`, response.data.error)
        status.isRateLimited = true
        status.rateLimitResetTime = Date.now() + RATE_LIMIT_BACKOFF

        // Continue to next endpoint
        continue
      }

      // Other error
      console.error(`Error response for ${method} on ${endpoint.name}:`, response.data)
      status.consecutiveFailures++
      status.backoffTime = Math.min(status.backoffTime * 2, MAX_BACKOFF_TIME)

      // Continue to next endpoint
      continue
    } catch (error) {
      console.error(`Error calling ${method} on ${endpoint.name}:`, error)

      // Increment failure count
      status.consecutiveFailures++
      status.backoffTime = Math.min(status.backoffTime * 2, MAX_BACKOFF_TIME)

      // Check if this is a rate limit error
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        status.isRateLimited = true
        status.rateLimitResetTime = Date.now() + RATE_LIMIT_BACKOFF
      }

      // Continue to next endpoint
      continue
    }
  }

  // All endpoints failed
  return {
    success: false,
    error: `All RPC endpoints failed for method ${method}. Please try again later.`,
  }
}

/**
 * Makes an RPC call with queuing, caching, and rate limit handling
 */
export async function rpcCall(method: string, params: any[] = [], bypassCache = false, priority = 1) {
  return queueRpcCall(method, params, bypassCache, priority)
}

/**
 * Gets the current slot
 */
export async function getCurrentSlot() {
  return await rpcCall("getSlot", [], false, 5) // High priority
}

/**
 * Gets the current epoch info
 */
export async function getEpochInfo() {
  return await rpcCall("getEpochInfo", [], false, 5) // High priority
}

/**
 * Gets vote accounts (validators)
 */
export async function getVoteAccounts() {
  return await rpcCall("getVoteAccounts", [], false, 5) // High priority
}

/**
 * Gets cluster nodes
 */
export async function getClusterNodes() {
  return await rpcCall("getClusterNodes", [], false, 3)
}

/**
 * Gets version
 */
export async function getVersion() {
  return await rpcCall("getVersion", [], false, 1)
}

/**
 * Gets transaction count
 */
export async function getTransactionCount() {
  return await rpcCall("getTransactionCount", [], false, 2)
}

/**
 * Gets signatures for address
 */
export async function getSignaturesForAddress(address: string, limit = 10) {
  return await rpcCall("getSignaturesForAddress", [address, { limit }], false, 2)
}

/**
 * Gets block production
 */
export async function getBlockProduction() {
  return await rpcCall("getBlockProduction", [], false, 2)
}

/**
 * Gets latest blockhash
 */
export async function getLatestBlockhash() {
  return await rpcCall("getLatestBlockhash", [], false, 4)
}

/**
 * Gets block time for a slot
 */
export async function getBlockTime(slot: number) {
  return await rpcCall("getBlockTime", [slot], false, 3)
}

/**
 * Gets recent blocks
 */
export async function getRecentBlocks(limit = 10) {
  try {
    const slotResult = await getCurrentSlot()
    if (!slotResult.success) {
      throw new Error(`Error in RPC response for getSlot: ${slotResult.error}`)
    }

    const currentSlot = slotResult.data
    const slots = Array.from({ length: limit }, (_, index) => currentSlot - index)

    // Fetch block times for each slot
    const blockPromises = slots.map(async (slot) => {
      try {
        const blockTimeResult = await getBlockTime(slot)
        if (!blockTimeResult.success) {
          return {
            slot,
            blockTime: Math.floor(Date.now() / 1000) - Math.floor(slot * 0.4),
            blockHeight: slot,
            validator: "Unknown",
            transactions: 0,
            totalFees: 0,
          }
        }

        return {
          slot,
          blockTime: blockTimeResult.data,
          blockHeight: slot,
          validator: "Unknown", // Simplified to avoid extra RPC calls
          transactions: 0, // Simplified to avoid extra RPC calls
          totalFees: 0, // Simplified to avoid extra RPC calls
        }
      } catch (error) {
        console.error(`Error fetching block time for slot ${slot}:`, error)
        return {
          slot,
          blockTime: Math.floor(Date.now() / 1000) - Math.floor(slot * 0.4),
          blockHeight: slot,
          validator: "Unknown",
          transactions: 0,
          totalFees: 0,
        }
      }
    })

    const blocks = await Promise.all(blockPromises)
    return { success: true, data: blocks }
  } catch (error) {
    console.error("Error fetching block details:", error)
    return { success: false, error: `Failed to fetch block details: ${(error as Error).message}` }
  }
}

/**
 * Gets account info
 */
export async function getAccountInfo(pubkey: string, encoding = "base64") {
  return await rpcCall("getAccountInfo", [pubkey, { encoding }], false, 3)
}

/**
 * Gets inflation reward
 */
export async function getInflationReward(addresses: string[], epoch?: number) {
  const params: any[] = [addresses]
  if (epoch !== undefined) {
    params.push({ epoch })
  }
  return await rpcCall("getInflationReward", params, false, 2)
}

/**
 * Gets stake activation
 */
export async function getStakeActivation(pubkey: string) {
  return await rpcCall("getStakeActivation", [pubkey], false, 2)
}

/**
 * Gets supply
 */
export async function getSupply() {
  return await rpcCall("getSupply", [], false, 3)
}

/**
 * Gets token accounts by owner
 */
export async function getTokenAccountsByOwner(owner: string, mint: string) {
  return await rpcCall("getTokenAccountsByOwner", [owner, { mint }, { encoding: "jsonParsed" }], false, 3)
}

/**
 * Gets program accounts
 */
export async function getProgramAccounts(programId: string, filters: any[] = []) {
  return await rpcCall("getProgramAccounts", [programId, { filters, encoding: "jsonParsed" }], false, 3)
}
