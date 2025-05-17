"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Coins, Users, AlertTriangle, Award, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  // Fetch network data
  const fetchNetworkData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/dashboard")

      if (!response.ok) {
        throw new Error(`Failed to fetch network data: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch network data")
      }

      setNetworkData(result.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching network data:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
      toast({
        title: "Error fetching data",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNetworkData()

    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchNetworkData, 10 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = async () => {
    try {
      await fetchNetworkData()
      toast({
        title: "Data refreshed successfully",
        description: "The latest network data has been loaded.",
        variant: "default",
      })
    } catch (error) {
      // Error is already handled in fetchNetworkData
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

  // Use network data if available
  const totalValidators = networkData?.validators?.total || 0
  const totalStake = networkData?.supply?.activeStake || "N/A"
  const delinquentValidators = networkData?.validators?.delinquent || 0
  const averageAPY = networkData?.validators?.estimatedApy || "N/A"

  return (
    <>
      <StatCard
        title="Total Validators"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        value={totalValidators > 0 ? totalValidators.toLocaleString() : "N/A"}
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
        value={delinquentValidators > 0 ? delinquentValidators.toLocaleString() : "N/A"}
      />
      <StatCard
        title="Average APY"
        icon={<Award className="h-4 w-4 text-muted-foreground" />}
        value={averageAPY !== "N/A" ? `${averageAPY}%` : "N/A"}
      />

      {error && (
        <div className="col-span-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message || "Failed to load data. Please try refreshing."}</AlertDescription>
          </Alert>
        </div>
      )}

      {lastUpdated && !error && (
        <div className="col-span-4 text-xs text-muted-foreground text-right">
          Last updated: {lastUpdated.toLocaleString()}
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
