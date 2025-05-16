"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useValidatorData } from "@/lib/hooks/use-validator-data"
import { Skeleton } from "@/components/ui/skeleton"

export function StakeDistribution() {
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
  )
}
