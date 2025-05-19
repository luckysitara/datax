"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/utils"

export function RiskAssessment() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchRiskData()
  }, [])

  const fetchRiskData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/validators")
      if (!response.ok) {
        throw new Error("Failed to fetch validators")
      }

      const validators = await response.json()

      // Calculate risk scores
      const riskData = validators
        .map((validator: any) => {
          // Calculate risk score based on various factors
          let riskScore = 0

          // Factor 1: Commission (higher commission = higher risk)
          riskScore += (validator.commission / 100) * 2

          // Factor 2: Delinquency (delinquent = higher risk)
          if (validator.delinquent) {
            riskScore += 30
          }

          // Factor 3: Stake concentration (higher stake = lower risk)
          const stakeInSOL = validator.activated_stake / 1e9
          if (stakeInSOL < 10000) {
            riskScore += 10
          } else if (stakeInSOL < 100000) {
            riskScore += 5
          }

          // Factor 4: APY (extremely high APY might indicate risk)
          if (validator.apy > 10) {
            riskScore += (validator.apy - 10) * 2
          }

          // Cap risk score at 100
          riskScore = Math.min(100, Math.max(0, riskScore))

          return {
            name: validator.name || validator.vote_pubkey.substring(0, 8) + "...",
            riskScore: Math.round(riskScore),
            stake: validator.activated_stake,
            commission: validator.commission,
            delinquent: validator.delinquent,
          }
        })
        .sort((a: any, b: any) => b.riskScore - a.riskScore)
        .slice(0, 10)

      setData(riskData)
    } catch (error) {
      console.error("Error fetching risk data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBarColor = (riskScore: number) => {
    if (riskScore >= 70) return "#ef4444" // High risk - red
    if (riskScore >= 40) return "#f59e0b" // Medium risk - amber
    return "#10b981" // Low risk - green
  }

  const renderTooltip = (props: any) => {
    const { active, payload } = props

    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p>Risk Score: {data.riskScore}</p>
          <p>Stake: {formatNumber(data.stake / 1e9)} SOL</p>
          <p>Commission: {data.commission}%</p>
          {data.delinquent && <p className="text-red-500">Delinquent</p>}
        </div>
      )
    }

    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Risk scores for validators based on multiple factors</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="riskScore" name="Risk Score" background={{ fill: "#f3f4f6" }} radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.riskScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
