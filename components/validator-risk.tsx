"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useValidator } from "@/lib/hooks/use-validator"

interface ValidatorRiskProps {
  validatorId: string
  detailed?: boolean
}

export function ValidatorRisk({ validatorId, detailed = false }: ValidatorRiskProps) {
  const { data: validator, isLoading } = useValidator(validatorId)

  if (isLoading) {
    return <div>Loading risk data...</div>
  }

  if (!validator) {
    return <div>Validator not found</div>
  }

  // Risk factors data
  const riskFactors = [
    { name: "Delinquency", value: validator.delinquent ? 80 : 10 },
    { name: "Concentration", value: validator.activatedStake > 500_000_000_000 ? 60 : 20 },
    { name: "Uptime", value: 15 },
    { name: "Skip Rate", value: 10 },
    { name: "Commission Changes", value: 25 },
  ]

  // Risk history data
  const riskHistory = [
    { epoch: 1, risk: 32 },
    { epoch: 2, risk: 28 },
    { epoch: 3, risk: 35 },
    { epoch: 4, risk: 30 },
    { epoch: 5, risk: 25 },
    { epoch: 6, risk: 28 },
    { epoch: 7, risk: 32 },
    { epoch: 8, risk: 30 },
    { epoch: 9, risk: 28 },
    { epoch: 10, risk: validator.riskScore },
  ]

  function getRiskLabel(score: number) {
    if (score < 20) return "Low"
    if (score < 50) return "Medium"
    return "High"
  }

  function getRiskColor(score: number) {
    if (score < 20) return "bg-green-50 text-green-700"
    if (score < 50) return "bg-yellow-50 text-yellow-700"
    return "bg-red-50 text-red-700"
  }

  if (!detailed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{validator.riskScore}</span>
          <Badge variant="outline" className={getRiskColor(validator.riskScore)}>
            {getRiskLabel(validator.riskScore)} Risk
          </Badge>
        </div>
        <Progress
          value={validator.riskScore}
          max={100}
          className={`h-2 w-full ${
            validator.riskScore < 20 ? "bg-green-200" : validator.riskScore < 50 ? "bg-yellow-200" : "bg-red-200"
          }`}
        />
        <div className="text-sm">
          <span className="text-muted-foreground">Primary risk factors:</span>{" "}
          {validator.delinquent ? "Delinquency, " : ""}
          {validator.activatedStake > 500_000_000_000 ? "Stake concentration" : "Low uptime"}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Risk Score</CardTitle>
            <CardDescription>Overall risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{validator.riskScore}</span>
                <Badge variant="outline" className={getRiskColor(validator.riskScore)}>
                  {getRiskLabel(validator.riskScore)}
                </Badge>
              </div>
              <Progress
                value={validator.riskScore}
                max={100}
                className={`h-2 w-full ${
                  validator.riskScore < 20 ? "bg-green-200" : validator.riskScore < 50 ? "bg-yellow-200" : "bg-red-200"
                }`}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Delinquency Status</CardTitle>
            <CardDescription>Current validator status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {validator.delinquent ? (
                <>
                  <Badge variant="destructive" className="mb-2">
                    Delinquent
                  </Badge>
                  <span className="text-sm text-muted-foreground">Last seen: 2 days ago</span>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="mb-2 bg-green-50 text-green-700">
                    Active
                  </Badge>
                  <span className="text-sm text-muted-foreground">Consistently voting</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Stake Concentration</CardTitle>
            <CardDescription>Validator's stake relative to network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">
                {((validator.activatedStake / 1_000_000_000_000) * 100).toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">of total network stake</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Factors</CardTitle>
          <CardDescription>Breakdown of risk components</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-[16/9] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskFactors}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 100,
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
                  width={90}
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
                                  Risk Score: {data.value}/100
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">
                                  Risk Level: {getRiskLabel(data.value)}
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
                  dataKey="value"
                  fill={(data) => {
                    const score = data.value
                    if (score < 20) return "#10b981" // green
                    if (score < 50) return "#f97316" // orange
                    return "#ef4444" // red
                  }}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk History</CardTitle>
          <CardDescription>Risk score trend over the last 10 epochs</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-[16/9] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={riskHistory}
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
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickMargin={8} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const score = payload[0].value as number
                      return (
                        <ChartTooltip>
                          <ChartTooltipContent
                            content={
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold">Epoch {payload[0].payload.epoch}</span>
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span className="text-xs font-medium text-muted-foreground">Risk Score: {score}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className={getRiskColor(score)}>
                                    {getRiskLabel(score)}
                                  </Badge>
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
                  dataKey="risk"
                  stroke="hsl(var(--primary))"
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
