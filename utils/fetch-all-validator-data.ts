import * as solanaRpc from "@/lib/solana-rpc"

// Decode validator identity metadata (if present)
function parseValidatorMetadata(data: any) {
  try {
    if (!data || !data[0]) return null

    const buffer = Buffer.from(data[0], "base64")
    const stringData = buffer.toString("utf8")
    const jsonStart = stringData.indexOf("{")
    if (jsonStart !== -1) {
      const jsonString = stringData.slice(jsonStart).trim()
      return JSON.parse(jsonString)
    }
  } catch (err) {
    // Malformed or missing metadata
    console.error("Error parsing validator metadata:", err)
  }
  return null
}

export async function fetchAllValidatorData() {
  try {
    // Use our improved RPC client
    const [voteAccountsResult, epochInfoResult] = await Promise.all([
      solanaRpc.getVoteAccounts(),
      solanaRpc.getEpochInfo(),
    ])

    if (!voteAccountsResult.success || !epochInfoResult.success) {
      throw new Error("Failed to fetch basic validator data")
    }

    const voteAccounts = voteAccountsResult.data
    const epochInfo = epochInfoResult.data
    const currentEpoch = epochInfo.epoch

    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
    const votePubkeys = allValidators.map((v) => v.votePubkey)
    const identityPubkeys = allValidators.map((v) => v.nodePubkey)

    // Fetch rewards in batches
    const rewardsMap: Record<string, number> = {}
    const batchSize = 25 // Smaller batch size to avoid rate limits
    for (let i = 0; i < votePubkeys.length; i += batchSize) {
      const chunk = votePubkeys.slice(i, i + batchSize)

      // Add delay between batches to avoid rate limits
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const rewardsResult = await solanaRpc.getInflationReward(chunk, currentEpoch - 1)

      if (rewardsResult.success && rewardsResult.data) {
        rewardsResult.data.forEach((r: any, index: number) => {
          if (r) {
            rewardsMap[chunk[index]] = r.amount || 0
          }
        })
      }
    }

    // Fetch validator identity account metadata (getAccountInfo)
    const identityAccounts: Record<string, any> = {}
    for (let i = 0; i < identityPubkeys.length; i += batchSize) {
      const chunk = identityPubkeys.slice(i, i + batchSize)

      // Add delay between batches to avoid rate limits
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const batchPromises = chunk.map(async (pubkey) => {
        const accountResult = await solanaRpc.getAccountInfo(pubkey)
        return { pubkey, result: accountResult }
      })

      const batchResults = await Promise.all(batchPromises)

      batchResults.forEach(({ pubkey, result }) => {
        if (result.success && result.data && result.data.data) {
          identityAccounts[pubkey] = parseValidatorMetadata(result.data.data)
        } else {
          identityAccounts[pubkey] = null
        }
      })
    }

    // Fetch stake activation status (for vote pubkeys used as stake account - approximation)
    const stakeStatusMap: Record<string, any> = {}
    for (let i = 0; i < votePubkeys.length; i += batchSize) {
      const chunk = votePubkeys.slice(i, i + batchSize)

      // Add delay between batches to avoid rate limits
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const batchPromises = chunk.map(async (pubkey) => {
        try {
          const stakeResult = await solanaRpc.getStakeActivation(pubkey)
          return { pubkey, result: stakeResult }
        } catch (error) {
          return { pubkey, result: { success: false } }
        }
      })

      const batchResults = await Promise.all(batchPromises)

      batchResults.forEach(({ pubkey, result }) => {
        stakeStatusMap[pubkey] = result.success ? result.data : null
      })
    }

    // Combine all validator data
    const allValidatorData = allValidators.map((validator) => ({
      votePubkey: validator.votePubkey,
      identityPubkey: validator.nodePubkey,
      commission: validator.commission,
      activatedStake: validator.activatedStake,
      epochCredits: validator.epochCredits,
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot,
      delinquent: voteAccounts.delinquent.some((d) => d.votePubkey === validator.votePubkey),
      reward: rewardsMap[validator.votePubkey] || 0,
      stakeStatus: stakeStatusMap[validator.votePubkey] || null,
      metadata: identityAccounts[validator.nodePubkey] || null,
    }))

    return {
      epoch: currentEpoch,
      totalValidators: allValidatorData.length,
      timestamp: new Date().toISOString(),
      validators: allValidatorData,
      source: "rpc",
    }
  } catch (error) {
    console.error("Error in fetchAllValidatorData:", error)
    throw error
  }
}
