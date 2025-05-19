"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { formatNumber } from "@/lib/utils"

export function StakeDistribution() {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics/stake")

        if (!response.ok) {
          throw new Error(`Failed to fetch stake distribution: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error("Invalid response format")
        }

        setData(result.data)
      } catch (error) {
        console.error("Error fetching stake distribution:", error)
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
        <p className="text-muted-foreground">Failed to load stake distribution: {error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No stake distribution data available</p>
      </div>
    )
  }

  // Colors for the pie chart
  const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#ec4899", "#14b8a6", "#f97316"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="stake"
          nameKey="category"
          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${formatNumber(value / 1e9)} SOL`, ""]}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
