"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export function TrainModelButton() {
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const { toast } = useToast()

  const handleTrainModel = async () => {
    try {
      setIsTraining(true)
      setProgress(0)
      setStatusMessage("Initializing training...")

      toast({
        title: "Training model",
        description: "This may take a few moments...",
      })

      setProgress(20)
      setStatusMessage("Fetching validator data...")

      // Call the API to train the model
      const response = await fetch("/api/model/train", {
        method: "POST",
      })

      setProgress(60)
      setStatusMessage("Processing predictions...")

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || response.statusText
        console.error("Training error response:", errorMessage)
        throw new Error(`Failed to train model: ${errorMessage}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to train model")
      }

      setProgress(100)
      setStatusMessage("Complete!")

      toast({
        title: "Model trained successfully",
        description: `Generated ${result.predictionsGenerated} predictions`,
        variant: "default",
      })

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error training model:", error)
      setStatusMessage("Failed")
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      // Keep the progress bar visible for a moment before resetting
      setTimeout(() => {
        setIsTraining(false)
        setProgress(0)
        setStatusMessage("")
      }, 3000)
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="default" onClick={handleTrainModel} disabled={isTraining} className="w-full">
        {isTraining ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Training...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Train Prediction Model
          </>
        )}
      </Button>

      {isTraining && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">{statusMessage}</p>
        </div>
      )}
    </div>
  )
}
