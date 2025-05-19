"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/utils"

export function ValidatorStats() {
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard")

        if (!response.ok) {
          throw new Error(`Failed to fetch validators: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error("Invalid response format")
        }

        setStats(result.data)
      } catch (error) {
        console.error("Error fetching validator stats:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
      </>
    )
  }

  if (error || !stats) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-500">Failed to load validator stats: {error}</div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Validators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.validators.total)}</div>
          <p className="text-xs text-muted-foreground">
            {formatNumber(stats.validators.active)} active, {formatNumber(stats.validators.delinquent)} delinquent
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.supply.activeStake)} SOL</div>
          <p className="text-xs text-muted-foreground">Active stake</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.validators.averageCommission}%</div>
          <p className="text-xs text-muted-foreground">Across all validators</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average APY</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.validators.estimatedApy}%</div>
          <p className="text-xs text-muted-foreground">Expected annual yield</p>
        </CardContent>
      </Card>
    </>
  )
}
