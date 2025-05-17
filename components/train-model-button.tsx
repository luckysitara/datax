"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function TrainModelButton() {
  const [isTraining, setIsTraining] = useState(false)
  const { toast } = useToast()

  const handleTrainModel = async () => {
    try {
      setIsTraining(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Model Training Started",
        description: "The prediction model is now training. This may take a few minutes.",
      })
    } catch (error) {
      console.error("Error training model:", error)
      toast({
        variant: "destructive",
        title: "Training Failed",
        description: "There was an error starting the model training. Please try again.",
      })
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <Button onClick={handleTrainModel} disabled={isTraining}>
      <Brain className="mr-2 h-4 w-4" />
      {isTraining ? "Training..." : "Train ML Model"}
    </Button>
  )
}
