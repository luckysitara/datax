"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RewardData {
  epoch: number
  avgReward: number
  topReward: number
  minReward: number
}

export function RewardTrend() {
  const [data, setData] = useState<RewardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRewardTrends = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/analytics/rewards")

      if (!response.ok) {
        throw new Error(`Failed to fetch reward trends: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch reward trends")
      }

      setData(result.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching reward trends:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRewardTrends()

    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchRewardTrends, 10 * 60 * 1000)

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
          Failed to load reward trends: {error.message}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchRewardTrends} disabled={isRefreshing}>
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
        <p className="text-muted-foreground">No reward trend data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Reward Trends</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={fetchRewardTrends} disabled={isRefreshing}>
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
      <ChartContainer className="aspect-[16/9] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="epoch"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              label={{ value: "Epoch", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltip>
                      <ChartTooltipContent
                        content={
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold">Epoch {payload[0].payload.epoch}</span>
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Top Reward: {payload[0].value}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Avg Reward: {payload[1].value}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Min Reward: {payload[2].value}%
                              </span>
                            </div>
                          </div>
                        }
                      />
                    </ChartTooltip>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="topReward"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="avgReward"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="minReward"
              stroke="hsl(var(--muted))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
