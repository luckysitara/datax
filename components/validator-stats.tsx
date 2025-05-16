"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Coins, Users, AlertTriangle, Award, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useValidatorData } from "@/lib/hooks/use-validator-data"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface NetworkData {
  validators: {
    total: number | null
    active: number | null
    delinquent: number | null
    averageCommission: string | null
    skipRate: string | null
    estimatedApy: string | null
  }
  supply: {
    activeStake: string | null
  }
}

export function ValidatorStats() {
  const { data, isLoading, error: validatorError, mutate } = useValidatorData()
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [networkError, setNetworkError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch network data
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const response = await fetch("/api/dashboard")

        if (!response.ok) {
          throw new Error(`Failed to fetch network data: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch network data")
        }

        setNetworkData(result.data)
        setNetworkError(null)
      } catch (err) {
        console.error("Error fetching network data:", err)
        setNetworkError(err instanceof Error ? err : new Error("Unknown error"))
      }
    }

    fetchNetworkData()
  }, [])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      toast({
        title: "Refreshing validator data",
        description: "This may take a few moments...",
      })

      const response = await fetch("/api/validators/fetch", {
        method: "GET",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || response.statusText
        console.error("Refresh error response:", errorMessage)
        throw new Error(`Failed to refresh: ${errorMessage}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to refresh validator data")
      }

      toast({
        title: "Data refreshed successfully",
        description: `Fetched data for ${result.totalValidators || "multiple"} validators`,
        variant: "default",
      })

      // Refresh the data
      await mutate()
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <StatCard
          title="Total Validators"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value="Loading..."
        />
        <StatCard title="Total Stake" icon={<Coins className="h-4 w-4 text-muted-foreground" />} value="Loading..." />
        <StatCard
          title="Delinquent Validators"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          value="Loading..."
        />
        <StatCard title="Average APY" icon={<Award className="h-4 w-4 text-muted-foreground" />} value="Loading..." />
      </>
    )
  }

  // Use network data if available, otherwise calculate from database
  const totalValidators =
    networkData?.validators?.total !== null && networkData?.validators?.total !== undefined
      ? networkData.validators.total
      : data && data.length > 0
        ? data.length
        : 0

  const totalStake = networkData?.supply?.activeStake || "N/A"

  const delinquentValidators =
    networkData?.validators?.delinquent !== null && networkData?.validators?.delinquent !== undefined
      ? networkData.validators.delinquent
      : data && data.length > 0
        ? data.filter((validator) => validator.delinquent).length
        : 0

  const averageAPY = networkData?.validators?.estimatedApy || "N/A"

  return (
    <>
      <StatCard
        title="Total Validators"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        value={totalValidators !== undefined && totalValidators > 0 ? totalValidators.toLocaleString() : "0"}
        action={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        }
      />
      <StatCard
        title="Total Stake"
        icon={<Coins className="h-4 w-4 text-muted-foreground" />}
        value={totalStake !== "N/A" ? `${totalStake}M SOL` : "N/A"}
      />
      <StatCard
        title="Delinquent Validators"
        icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        value={
          delinquentValidators !== null && delinquentValidators !== undefined
            ? delinquentValidators.toLocaleString()
            : "N/A"
        }
      />
      <StatCard
        title="Average APY"
        icon={<Award className="h-4 w-4 text-muted-foreground" />}
        value={averageAPY !== "N/A" ? `${averageAPY}%` : "N/A"}
      />

      {(validatorError || networkError) && (
        <div className="col-span-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {validatorError?.message || networkError?.message || "Failed to load data. Please try refreshing."}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  )
}

function StatCard({
  title,
  icon,
  value,
  trend,
  action,
}: {
  title: string
  icon: React.ReactNode
  value: string
  trend?: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  )
}
