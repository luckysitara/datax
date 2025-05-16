"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface StakeData {
  name: string
  stake: number
  unstake: number
}

export function Overview() {
  const [data, setData] = useState<StakeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStakeData = async () => {
      try {
        setIsLoading(true)

        // In a real implementation, we would fetch this data from an API
        // For now, we'll generate some realistic data based on current date
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()

        // Generate data for the last 7 months
        const generatedData: StakeData[] = []
        for (let i = 6; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12
          const month = months[monthIndex]

          // Generate realistic but random data
          // Base values that increase over time
          const baseStake = 18 + (6 - i) * 3 + Math.random() * 2
          const baseUnstake = 12 + (6 - i) * 1.5 + Math.random() * 1.5

          generatedData.push({
            name: month,
            stake: Number.parseFloat(baseStake.toFixed(1)),
            unstake: Number.parseFloat(baseUnstake.toFixed(1)),
          })
        }

        setData(generatedData)
        setError(null)
      } catch (err) {
        console.error("Error generating stake data:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStakeData()
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>Error loading stake data. Please try again later.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  return (
    <ChartContainer className="aspect-[4/3] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={8}
            tickFormatter={(value) => `${value}M`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <ChartTooltip>
                    <ChartTooltipContent
                      content={
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Stake: {payload[0].value}M SOL
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Unstake: {payload[1].value}M SOL
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
          <Bar dataKey="stake" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unstake" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
