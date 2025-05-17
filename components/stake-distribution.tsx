"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ValidatorData {
  pubkey: string
  activated_stake: number
  delinquent: boolean
}

export function StakeDistribution() {
  const [data, setData] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/validators")

      if (!response.ok) {
        throw new Error(`Failed to fetch validators: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch validators")
      }

      setData(result.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching validators:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchData, 10 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load stake distribution: {error.message}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No validator data available. Please refresh the data.</p>
      </div>
    )
  }

  // Group validators by stake size
  const superMajority = data.filter((v) => v.activated_stake > 1_000_000_000_000).length
  const large = data.filter((v) => v.activated_stake > 500_000_000_000 && v.activated_stake <= 1_000_000_000_000).length
  const medium = data.filter((v) => v.activated_stake > 100_000_000_000 && v.activated_stake <= 500_000_000_000).length
  const small = data.filter((v) => v.activated_stake <= 100_000_000_000).length

  const distributionData = [
    { name: "Super Majority", value: superMajority, color: "#ef4444" },
    { name: "Large Validators", value: large, color: "#f97316" },
    { name: "Medium Validators", value: medium, color: "#3b82f6" },
    { name: "Small Validators", value: small, color: "#10b981" },
  ].filter((item) => item.value > 0) // Only include categories with values

  if (distributionData.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No stake distribution data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Stake Distribution</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      <ChartContainer className="aspect-[4/3] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltip>
                      <ChartTooltipContent
                        content={
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold">{payload[0].name}</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {payload[0].value} validators ({((payload[0].value / data.length) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        }
                      />
                    </ChartTooltip>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
