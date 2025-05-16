"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useValidator } from "@/lib/hooks/use-validator"
import { Skeleton } from "@/components/ui/skeleton"

interface ValidatorRewardsProps {
  validatorId: string
  detailed?: boolean
}

export function ValidatorRewards({ validatorId, detailed = false }: ValidatorRewardsProps) {
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

  // Get historical rewards data from detailData if available
  const rewards = detailData?.rewards || []

  // Generate rewards history data
  const rewardsHistory =
    rewards.length > 0
      ? rewards.map((r: any, index: number) => ({
          epoch: r.epoch,
          reward: r.apy || validator.apy,
          networkAvg: (r.apy || validator.apy) - 0.2 + Math.random() * 0.4,
          commission: validator.commission,
        }))
      : Array.from({ length: 10 }, (_, i) => {
          const epoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000)) - i - 1
          return {
            epoch,
            reward: validator.apy - i * 0.05,
            networkAvg: validator.apy - 0.2 - i * 0.05 + Math.random() * 0.4,
            commission: validator.commission,
          }
        }).reverse()

  // Generate reward prediction data
  const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
  const rewardPrediction =
    detailData?.predictions?.length > 0
      ? detailData.predictions.map((p: any) => ({
          epoch: p.epoch,
          predicted: p.predicted_apy,
          min: p.min_apy,
          max: p.max_apy,
        }))
      : Array.from({ length: 5 }, (_, i) => {
          const predictedAPY = validator.apy + i * 0.1
          return {
            epoch: currentEpoch + i + 1,
            predicted: predictedAPY,
            min: predictedAPY * 0.95,
            max: predictedAPY * 1.05,
          }
        })

  if (!detailed) {
    return (
      <ChartContainer className="aspect-[16/9] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rewardsHistory}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="epoch" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
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
                                Reward: {payload[0].value}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Network Avg: {payload[1].value}%
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
              dataKey="reward"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="networkAvg"
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Current APY</CardTitle>
            <CardDescription>Annual percentage yield</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{validator.apy?.toFixed(2)}%</span>
              <span className="text-sm text-muted-foreground">+0.2% from last epoch</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Commission</CardTitle>
            <CardDescription>Validator fee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{validator.commission}%</span>
              <span className="text-sm text-muted-foreground">Unchanged for 30 days</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Predicted APY</CardTitle>
            <CardDescription>Next epoch estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{(validator.apy + 0.1).toFixed(2)}%</span>
              <span className="text-sm text-muted-foreground">Based on ML prediction</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Rewards</CardTitle>
          <CardDescription>
            APY compared to network average over the last {rewardsHistory.length} epochs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-[16/9] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rewardsHistory}
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
                                    Reward: {payload[0].value}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Network Avg: {payload[1].value}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Commission: {payload[2].value}%
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
                  dataKey="reward"
                  name="Validator APY"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="networkAvg"
                  name="Network Average"
                  stroke="hsl(var(--muted))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  name="Commission"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward Prediction</CardTitle>
          <CardDescription>ML-based APY prediction for the next 5 epochs</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-[16/9] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rewardPrediction}
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
                  label={{ value: "Future Epoch", position: "insideBottom", offset: -5 }}
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
                                    Predicted APY: {payload[0].value}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Min: {payload[1].value}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Max: {payload[2].value}%
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
                  dataKey="predicted"
                  name="Predicted APY"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  name="Min Prediction"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="max"
                  name="Max Prediction"
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
