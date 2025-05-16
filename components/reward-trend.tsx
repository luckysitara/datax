"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

// Sample data for reward trends
const sampleData = [
  { epoch: 1, avgReward: 5.8, topReward: 7.2, minReward: 4.5 },
  { epoch: 2, avgReward: 5.9, topReward: 7.3, minReward: 4.6 },
  { epoch: 3, avgReward: 6.0, topReward: 7.4, minReward: 4.7 },
  { epoch: 4, avgReward: 6.1, topReward: 7.5, minReward: 4.8 },
  { epoch: 5, avgReward: 6.2, topReward: 7.6, minReward: 4.9 },
  { epoch: 6, avgReward: 6.3, topReward: 7.7, minReward: 5.0 },
  { epoch: 7, avgReward: 6.4, topReward: 7.8, minReward: 5.1 },
  { epoch: 8, avgReward: 6.5, topReward: 7.9, minReward: 5.2 },
  { epoch: 9, avgReward: 6.6, topReward: 8.0, minReward: 5.3 },
  { epoch: 10, avgReward: 6.7, topReward: 8.1, minReward: 5.4 },
  { epoch: 11, avgReward: 6.8, topReward: 8.2, minReward: 5.5 },
  { epoch: 12, avgReward: 6.9, topReward: 8.3, minReward: 5.6 },
]

export function RewardTrend() {
  const [data, setData] = useState(sampleData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRewardTrends = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/analytics/rewards")

        if (!response.ok) {
          throw new Error(`Failed to fetch reward trends: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success && result.data && result.data.length > 0) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error fetching reward trends:", error)
        // Fall back to sample data
      } finally {
        setIsLoading(false)
      }
    }

    fetchRewardTrends()
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
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
  )
}
