"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  signature: string
  slot: number
  timestamp: number
  fee: number
  status: "success" | "failed"
  type: string
}

export function RecentTransactions({ limit = 5 }: { limit?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchTransactions = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/transactions?limit=${limit}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transactions")
      }

      setTransactions(result.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTransactions()

    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchTransactions, 10 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [limit])

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
          Failed to load transactions: {error.message}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isRefreshing}>
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found.</p>
        <Button variant="outline" size="sm" onClick={fetchTransactions} className="mt-4" disabled={isRefreshing}>
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
          <span className="text-sm text-muted-foreground">Showing {transactions.length} transactions</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isRefreshing}>
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
              <TableHead>Signature</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fee (SOL)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.signature}>
                <TableCell className="font-mono text-xs truncate max-w-[200px]">
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600"
                  >
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                  </a>
                </TableCell>
                <TableCell>{new Date(tx.timestamp * 1000).toLocaleString()}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>{(tx.fee / 1e9).toFixed(6)}</TableCell>
                <TableCell>
                  {tx.status === "success" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
