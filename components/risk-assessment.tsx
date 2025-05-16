"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useValidatorData } from "@/lib/hooks/use-validator-data"
import { Skeleton } from "@/components/ui/skeleton"

export function RiskAssessment() {
  const { data, isLoading } = useValidatorData()

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No validator data available. Please refresh the data.</p>
      </div>
    )
  }

  // Get top 10 validators by stake and calculate their risk scores
  const topValidators = [...data]
    .sort((a, b) => b.activated_stake - a.activated_stake)
    .slice(0, 10)
    .map((v) => ({
      name: v.name || v.pubkey.slice(0, 8),
      riskScore: v.risk_score || 0,
      delinquent: v.delinquent,
    }))

  if (topValidators.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No risk assessment data available.</p>
      </div>
    )
  }

  return (
    <ChartContainer className="aspect-[4/3] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topValidators}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 70,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={8}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <ChartTooltip>
                    <ChartTooltipContent
                      content={
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold">{data.name}</span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Risk Score: {data.riskScore}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Status: {data.delinquent ? "Delinquent" : "Active"}
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
          <Bar
            dataKey="riskScore"
            fill={(data) => {
              const score = data.riskScore
              if (score < 20) return "#10b981" // green
              if (score < 50) return "#f97316" // orange
              return "#ef4444" // red
            }}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
