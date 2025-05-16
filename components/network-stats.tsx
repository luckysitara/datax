"use client"

import { useEffect, useState } from "react"
import { Clock, Database, Activity, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface NetworkData {
  network: {
    currentSlot: number | null
    currentEpoch: number | null
    epochProgress: string | null
    timeUntilNextEpoch: string | null
    slotsInEpoch: number | null
    slotTime: string | null
    currentTps: string | null
    recentBlockhash: string | null
    blockTime: number | null
    version: string | null
    transactionCount: number | null
  }
  validators: {
    total: number | null
    active: number | null
    delinquent: number | null
    averageCommission: string | null
    skipRate: string | null
    estimatedApy: string | null
    superminority: number | null
  }
  supply: {
    circulating: string | null
    total: string | null
    circulatingPercentage: string | null
    activeStake: string | null
    activeStakePercentage: string | null
  }
  dbError: string | null
}

export function NetworkStats() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/dashboard")

      if (!response.ok) {
        throw new Error(`Failed to fetch network data: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch network data")
      }

      setData(result.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching network data:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000)

    return () => clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>Error loading network data. Please try again later.</p>
        {error && <p className="text-sm">{error.message}</p>}
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing} className="mt-2">
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slot Height</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.network.currentSlot !== null ? data.network.currentSlot.toLocaleString() : "N/A"}
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {data.network.currentEpoch !== null ? `Epoch ${data.network.currentEpoch}` : "Epoch N/A"}
                </span>
                <span>{data.network.epochProgress || "N/A"}%</span>
              </div>
              <Progress
                value={data.network.epochProgress ? Number.parseFloat(data.network.epochProgress) : 0}
                className="h-1"
              />
              <div className="text-xs text-muted-foreground">ETA: {data.network.timeUntilNextEpoch || "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current TPS</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.network.currentTps || "N/A"}</div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Slot Time</span>
                <span>{data.network.slotTime || "N/A"}s</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Skip Rate</span>
                <span>{data.validators.skipRate || "N/A"}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Transactions</span>
                <span>
                  {data.network.transactionCount !== null ? data.network.transactionCount.toLocaleString() : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validators</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.validators.total !== null ? data.validators.total.toLocaleString() : "N/A"}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active</span>
                <span>{data.validators.active !== null ? data.validators.active.toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Delinquent</span>
                <span>{data.validators.delinquent !== null ? data.validators.delinquent.toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg. APY</span>
                <span>{data.validators.estimatedApy || "N/A"}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stake</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.supply.activeStake ? `${data.supply.activeStake}M SOL` : "N/A"}
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">% of Supply</span>
                <span>{data.supply.activeStakePercentage || "N/A"}%</span>
              </div>
              <Progress
                value={data.supply.activeStakePercentage ? Number.parseFloat(data.supply.activeStakePercentage) : 0}
                className="h-1"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Circulating</span>
                <span>{data.supply.circulating ? `${data.supply.circulating}M SOL` : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.dbError && (
        <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2 text-yellow-700 text-sm">
          <p>Note: Database connection error. Some validator data may be unavailable.</p>
        </div>
      )}
    </div>
  )
}
