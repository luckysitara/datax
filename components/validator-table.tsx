"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ValidatorData {
  pubkey: string
  name: string | null
  commission: number
  activated_stake: number
  delinquent: boolean
  performance_score: number | null
  risk_score: number | null
  apy: number | null
}

export function ValidatorTable({ filter = "all" }: { filter?: string }) {
  const [validators, setValidators] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchValidators = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/validators?filter=${filter}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch validators: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch validators")
      }

      setValidators(result.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching validators:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchValidators()

    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchValidators, 10 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [filter])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load validators: {error.message}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchValidators} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (validators.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No validators found. Please try a different filter.</p>
        <Button variant="outline" size="sm" onClick={fetchValidators} className="mt-4" disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-muted-foreground">Showing {validators.length} validators</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={fetchValidators} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Validator</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Stake (SOL)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>APY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validators.map((validator) => (
              <TableRow key={validator.pubkey}>
                <TableCell className="font-medium">
                  <a
                    href={`/validators/${validator.pubkey}`}
                    className="hover:underline text-blue-600 truncate block max-w-[200px]"
                  >
                    {validator.name || validator.pubkey.slice(0, 8) + "..."}
                  </a>
                </TableCell>
                <TableCell>{validator.commission}%</TableCell>
                <TableCell>{(validator.activated_stake / 1e9).toFixed(2)}M</TableCell>
                <TableCell>
                  {validator.delinquent ? (
                    <Badge variant="destructive">Delinquent</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="h-2 rounded-full mr-2"
                      style={{
                        width: "50px",
                        backgroundColor: getPerformanceColor(validator.performance_score),
                      }}
                    ></div>
                    {validator.performance_score}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="h-2 rounded-full mr-2"
                      style={{
                        width: "50px",
                        backgroundColor: getRiskColor(validator.risk_score),
                      }}
                    ></div>
                    {validator.risk_score}
                  </div>
                </TableCell>
                <TableCell>{validator.apy?.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function getPerformanceColor(score: number | null): string {
  if (score === null) return "#e5e7eb"
  if (score >= 80) return "#10b981"
  if (score >= 60) return "#f59e0b"
  return "#ef4444"
}

function getRiskColor(score: number | null): string {
  if (score === null) return "#e5e7eb"
  if (score <= 30) return "#10b981"
  if (score <= 60) return "#f59e0b"
  return "#ef4444"
}
