"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export function FetchValidatorsButton() {
  const [isFetching, setIsFetching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const { toast } = useToast()

  const handleFetchValidators = async () => {
    try {
      setIsFetching(true)
      setProgress(0)
      setStatusMessage("Initializing...")

      toast({
        title: "Fetching validator data",
        description: "This may take a few minutes...",
      })

      // Start the fetch process
      setStatusMessage("Fetching vote accounts...")
      setProgress(10)

      // Call the API to fetch validator data
      const response = await fetch("/api/validators/fetch-all", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || response.statusText
        console.error("Fetch error response:", errorMessage)
        throw new Error(`Failed to fetch validator data: ${errorMessage}`)
      }

      setProgress(90)
      setStatusMessage("Processing results...")

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch validator data")
      }

      setProgress(100)
      setStatusMessage("Complete!")

      toast({
        title: "Validator data fetched successfully",
        description: `Fetched ${result.totalValidators} validators for epoch ${result.epoch}`,
        variant: "default",
      })

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error fetching validator data:", error)
      setStatusMessage("Failed")
      toast({
        title: "Fetch failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      // Keep the progress bar visible for a moment before resetting
      setTimeout(() => {
        setIsFetching(false)
        setProgress(0)
        setStatusMessage("")
      }, 3000)
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="default" onClick={handleFetchValidators} disabled={isFetching} className="w-full">
        {isFetching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Fetching...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Fetch Validator Data
          </>
        )}
      </Button>

      {isFetching && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">{statusMessage}</p>
        </div>
      )}
    </div>
  )
}
