"use client"

import { useState, useEffect } from "react"

// Define prediction data type
export interface PredictionData {
  validator_pubkey: string
  epoch: number
  predicted_apy: number
  min_apy: number
  max_apy: number
  predicted_risk: number
  confidence: number
}

// Hook to fetch prediction for a validator
export function usePrediction(validatorId: string) {
  const [data, setData] = useState<PredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch from our API
        const response = await fetch(`/api/model/predict/${validatorId}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch prediction")
        }

        setData(result.data)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setIsLoading(false)
      }
    }

    if (validatorId) {
      fetchData()
    }
  }, [validatorId])

  return { data, isLoading, error }
}
