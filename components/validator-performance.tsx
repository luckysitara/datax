"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useValidator } from "@/lib/hooks/use-validator"
import { Skeleton } from "@/components/ui/skeleton"

interface ValidatorPerformanceProps {
  validatorId: string
  detailed?: boolean
}

export function ValidatorPerformance({ validatorId, detailed = false }: ValidatorPerformanceProps) {
  const { data: validator, detailData, isLoading } = useValidator(validatorId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (!validator) {
    return <div className="p-4 text-red-500">Validator not found</div>
  }

  // Get historical performance data from detailData if available
  const history = detailData?.history || []

  // Generate performance history data
  const performanceHistory =
    history.length > 0
      ? history.map((h: any, index: number) => ({
          epoch: h.epoch,
          score: h.performance_score || validator.performance_score - index * 0.5,
          uptime: 99.8 - index * 0.1,
          skipRate: 0.1 + index * 0.05,
        }))
      : Array.from({ length: 10 }, (_, i) => {
          const epoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000)) - i
          return {
            epoch,
            score: validator.performance_score - i * 0.5,
            uptime: 99.8 - i * 0.1,
            skipRate: 0.1 + i * 0.05,
          }
        }).reverse()

  if (!detailed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{validator.performance_score?.toFixed(1) || "N/A"}</span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
        <Progress value={validator.performance_score} className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Uptime:</span> 99.9%
          </div>
          <div>
            <span className="text-muted-foreground">Skip Rate:</span> 0.1%
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Performance Score</CardTitle>
            <CardDescription>Overall validator rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold">{validator.performance_score?.toFixed(1) || "N/A"}</span>
              <Progress value={validator.performance_score} className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Uptime</CardTitle>
            <CardDescription>Vote transaction success rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold">99.9%</span>
              <Progress value={99.9} className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Skip Rate</CardTitle>
            <CardDescription>Percentage of skipped slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold">0.1%</span>
              <Progress value={0.1} max={5} className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>
            Historical performance metrics over the last {performanceHistory.length} epochs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-[16/9] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceHistory}
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
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickMargin={8} domain={[80, 100]} />
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
                                    Score: {payload[0].value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Uptime: {payload[1].value}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Skip Rate: {payload[2].value}%
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Performance Score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="uptime"
                  name="Uptime %"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="skipRate"
                  name="Skip Rate %"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
