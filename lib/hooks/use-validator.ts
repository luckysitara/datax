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
}

export function useValidator(validatorId: string) {
  const { data, error, isLoading, mutate } = useSWR<ValidatorData>(
    validatorId ? `/api/validators/${validatorId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes
      errorRetryCount: 3,
    },
  )

  const [detailData, setDetailData] = useState<ValidatorDetailData>({})
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<Error | null>(null)

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
        setDetailError(null)
      } catch (error) {
        console.error("Error fetching validator detail data:", error)
        setDetailError(error instanceof Error ? error : new Error("Failed to fetch detail data"))
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
    detailError,
    isLoading: isLoading || detailLoading,
    mutate,
  }
}
