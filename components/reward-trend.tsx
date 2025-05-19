"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function RewardTrend() {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics/rewards")

        if (!response.ok) {
          throw new Error(`Failed to fetch reward trends: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error("Invalid response format")
        }

        setData(result.data)
      } catch (error) {
        console.error("Error fetching reward trends:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error || !data) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load reward trends: {error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No reward data available</p>
      </div>
    )
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.time).toLocaleDateString(),
    apy: item.avg_apy,
    min_apy: item.min_apy,
    max_apy: item.max_apy,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
        <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, ""]} labelFormatter={(label) => `Date: ${label}`} />
        <Legend />
        <Line type="monotone" dataKey="min_apy" stroke="#94a3b8" strokeWidth={1} dot={false} name="Min APY" />
        <Line type="monotone" dataKey="apy" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Average APY" />
        <Line type="monotone" dataKey="max_apy" stroke="#22c55e" strokeWidth={1} dot={false} name="Max APY" />
      </LineChart>
    </ResponsiveContainer>
  )
}
