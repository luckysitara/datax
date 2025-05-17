"use client"

import useSWR from "swr"

// Define validator data type
export interface ValidatorData {
  pubkey: string
  name: string | null
  commission: number
  activated_stake: number
  delinquent: boolean
  last_vote: number | null
  apy: number | null
  performance_score: number | null
  risk_score: number | null
  created_at?: string
  updated_at?: string
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

// Hook to fetch validator data
export function useValidatorData(filter = "all") {
  let url = "/api/validators"
  if (filter !== "all") {
    url += `?filter=${filter}`
  }

  const { data, error, isLoading, mutate } = useSWR<ValidatorData[]>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000, // 10 minutes
    errorRetryCount: 3,
  })

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  }
}
