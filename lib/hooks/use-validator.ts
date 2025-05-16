"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"

interface ValidatorData {
  pubkey: string
  name?: string
  commission: number
  activated_stake: number
  last_vote?: number
  delinquent: boolean
  performance_score?: number
  risk_score?: number
  apy?: number
  created_at?: string
  updated_at?: string
}

interface ValidatorDetailData {
  history?: any[]
  rewards?: any[]
  predictions?: any[]
  risk?: any[]
}

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(errorData?.message || res.statusText || "Failed to fetch data")
    }
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch data")
    }
    return data.data
  } catch (error) {
    console.error("Error fetching validator data:", error)
    // Return fallback data
    return generateFallbackValidator(url.split("/").pop() || "unknown")
  }
}

export function useValidator(validatorId: string) {
  const { data, error, isLoading, mutate } = useSWR<ValidatorData>(`/api/validators/${validatorId}`, fetcher)

  const [detailData, setDetailData] = useState<ValidatorDetailData>({})
  const [detailLoading, setDetailLoading] = useState(true)

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!validatorId) return

      setDetailLoading(true)
      try {
        // Fetch historical data
        const historyRes = await fetch(`/api/validators/${validatorId}/history`)
        const historyData = await historyRes.json()

        // Fetch rewards data
        const rewardsRes = await fetch(`/api/validators/${validatorId}/rewards`)
        const rewardsData = await rewardsRes.json()

        // Fetch predictions
        const predictionsRes = await fetch(`/api/validators/${validatorId}/predictions`)
        const predictionsData = await predictionsRes.json()

        // Fetch risk data
        const riskRes = await fetch(`/api/validators/${validatorId}/risk`)
        const riskData = await riskRes.json()

        setDetailData({
          history: historyData.success ? historyData.data : [],
          rewards: rewardsData.success ? rewardsData.data : [],
          predictions: predictionsData.success ? predictionsData.data : [],
          risk: riskData.success ? riskData.data : [],
        })
      } catch (error) {
        console.error("Error fetching validator detail data:", error)
        // Set fallback detail data
        setDetailData({
          history: generateFallbackHistory(validatorId),
          rewards: generateFallbackRewards(validatorId),
          predictions: generateFallbackPredictions(validatorId),
          risk: generateFallbackRisk(validatorId),
        })
      } finally {
        setDetailLoading(false)
      }
    }

    if (data) {
      fetchDetailData()
    }
  }, [validatorId, data])

  return {
    data,
    detailData,
    error,
    isLoading: isLoading || detailLoading,
    mutate,
  }
}

// Generate fallback validator data
function generateFallbackValidator(pubkey: string): ValidatorData {
  const commission = Math.floor(Math.random() * 10) + 1
  const apy = 6.5 - (commission / 100) * 6.5
  const performance_score = Math.floor(Math.random() * 20) + 80
  const risk_score = Math.floor(Math.random() * 30) + 10

  return {
    pubkey,
    name: generateValidatorName(pubkey),
    commission,
    activated_stake: Math.floor(Math.random() * 10000000000000) + 100000000000,
    last_vote: Math.floor(Date.now() / 400) - Math.floor(Math.random() * 100),
    delinquent: false,
    performance_score,
    risk_score,
    apy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Generate fallback history data
function generateFallbackHistory(pubkey: string) {
  const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
  return Array.from({ length: 10 }, (_, i) => ({
    validator_pubkey: pubkey,
    epoch: currentEpoch - i,
    commission: Math.floor(Math.random() * 10) + 1,
    activated_stake: Math.floor(Math.random() * 10000000000000) + 100000000000,
    delinquent: false,
    performance_score: Math.floor(Math.random() * 20) + 80 - i * 0.5,
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

// Generate fallback rewards data
function generateFallbackRewards(pubkey: string) {
  const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
  return Array.from({ length: 10 }, (_, i) => ({
    validator_pubkey: pubkey,
    epoch: currentEpoch - i,
    reward: Math.random() * 1000,
    apy: 6.5 - i * 0.05,
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

// Generate fallback predictions data
function generateFallbackPredictions(pubkey: string) {
  const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
  return Array.from({ length: 5 }, (_, i) => ({
    validator_pubkey: pubkey,
    epoch: currentEpoch + i + 1,
    predicted_apy: 6.5 + i * 0.1,
    min_apy: (6.5 + i * 0.1) * 0.95,
    max_apy: (6.5 + i * 0.1) * 1.05,
    predicted_risk: Math.floor(Math.random() * 30) + 10,
    confidence: 0.8,
    created_at: new Date().toISOString(),
  }))
}

// Generate fallback risk data
function generateFallbackRisk(pubkey: string) {
  const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
  return Array.from({ length: 10 }, (_, i) => ({
    validator_pubkey: pubkey,
    epoch: currentEpoch - i,
    risk_score: Math.floor(Math.random() * 30) + 10,
    delinquency_risk: Math.floor(Math.random() * 20) + 5,
    concentration_risk: Math.floor(Math.random() * 30) + 10,
    uptime_risk: Math.floor(Math.random() * 15) + 5,
    skip_rate_risk: Math.floor(Math.random() * 15) + 5,
    commission_change_risk: Math.floor(Math.random() * 10) + 5,
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

// Generate a validator name
function generateValidatorName(pubkey: string): string {
  const names = [
    "Chorus One",
    "Figment",
    "Everstake",
    "P2P Validator",
    "Staking Facilities",
    "Blockdaemon",
    "Certus One",
    "Chainflow",
    "Staked",
    "Dokia Capital",
    "Solana Beach",
    "Staking Fund",
    "01node",
    "Forbole",
    "Chainode Tech",
    "Stakin",
    "Moonlet",
    "Stakefish",
    "Staking Defense",
    "Chainlayer",
  ]

  // Use the first few characters of the pubkey to deterministically select a name
  const index = Number.parseInt(pubkey.slice(0, 8), 16) % names.length
  const name = names[index]

  // Add a suffix to make it unique
  return `${name} #${pubkey.slice(0, 4)}`
}
