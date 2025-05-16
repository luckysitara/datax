"use client"

import { Badge } from "@/components/ui/badge"
import { usePrediction } from "@/lib/hooks/use-prediction"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ValidatorPredictionProps {
  validatorId: string
}

export function ValidatorPrediction({ validatorId }: ValidatorPredictionProps) {
  const { data, isLoading, error } = usePrediction(validatorId)
  const [generating, setGenerating] = useState(false)

  const handleGeneratePrediction = async () => {
    try {
      setGenerating(true)
      const response = await fetch(`/api/model/predict/${validatorId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to generate prediction")
      }

      // Reload the page to show updated prediction
      window.location.reload()
    } catch (error) {
      console.error("Error generating prediction:", error)
      alert("Failed to generate prediction. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full" />
  }

  if (error || !data || data.predicted_apy === null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">No prediction available</span>
          <Button size="sm" onClick={handleGeneratePrediction} disabled={generating}>
            {generating ? "Generating..." : "Generate Prediction"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{data.predicted_apy.toFixed(2)}%</span>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Predicted
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Min: {data.min_apy.toFixed(2)}%</span>
          <span>Max: {data.max_apy.toFixed(2)}%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-100">
          <div
            className="absolute left-0 top-0 h-full bg-blue-500"
            style={{
              width: `${((data.predicted_apy - data.min_apy) / (data.max_apy - data.min_apy)) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Confidence: {data.confidence !== null ? (data.confidence * 100).toFixed(0) : "N/A"}%
        </span>
        <Button size="sm" variant="outline" onClick={handleGeneratePrediction} disabled={generating}>
          {generating ? "Updating..." : "Update Prediction"}
        </Button>
      </div>
    </div>
  )
}
