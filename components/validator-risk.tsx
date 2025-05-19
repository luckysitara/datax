"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ValidatorRiskProps {
  validatorId: string
}

export function ValidatorRisk({ validatorId }: ValidatorRiskProps) {
  const [riskData, setRiskData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (validatorId) {
      fetchRiskData()
    }
  }, [validatorId])

  const fetchRiskData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/validators/${validatorId}/risk`)
      if (!response.ok) {
        throw new Error("Failed to fetch risk data")
      }
      const data = await response.json()
      setRiskData(data)
    } catch (error) {
      console.error("Error fetching risk data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return "High"
    if (score >= 40) return "Medium"
    return "Low"
  }

  const getRiskIcon = (score: number) => {
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (score >= 40) return <Info className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validator Risk Assessment</CardTitle>
        <CardDescription>Assesses the risk level associated with this validator.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading ? (
          <>
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[80%]" />
          </>
        ) : riskData ? (
          <>
            <div className="flex items-center space-x-2">
              <Badge className="gap-1">
                Risk Level: {getRiskLevel(riskData.overall_risk_score)} {getRiskIcon(riskData.overall_risk_score)}
              </Badge>
            </div>
            <Progress value={riskData.overall_risk_score} className={getRiskColor(riskData.overall_risk_score)} />
            <div className="space-y-1 text-sm">
              <p className="text-zinc-500 dark:text-zinc-400">Overall Risk Score: {riskData.overall_risk_score}</p>
              <p className="text-zinc-500 dark:text-zinc-400">Slashing Risk: {riskData.slashing_risk}</p>
              <p className="text-zinc-500 dark:text-zinc-400">Performance Risk: {riskData.performance_risk}</p>
            </div>
          </>
        ) : (
          <div>Failed to load risk data.</div>
        )}
      </CardContent>
    </Card>
  )
}
