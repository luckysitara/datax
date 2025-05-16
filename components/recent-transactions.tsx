"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface Transaction {
  signature: string
  slot: number
  blockTime: number
  fee: number | null
  status: string
  instructions: number | null
  instructionType: string
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchTransactions = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/transactions?limit=10")

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transactions")
      }

      setTransactions(result.data)
      setError(null)
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

    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchTransactions, 30000)

    return () => clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>Error loading transactions. Please try again later.</p>
        <p className="text-sm">{error.message}</p>
        <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isRefreshing} className="mt-2">
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </>
          )}
        </Button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center">
        <p className="text-muted-foreground">No transactions available.</p>
        <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isRefreshing} className="mt-2">
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signature</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              // Format time ago
              const now = Math.floor(Date.now() / 1000)
              const secondsAgo = now - tx.blockTime
              const timeAgo =
                secondsAgo < 60
                  ? `${secondsAgo}s ago`
                  : secondsAgo < 3600
                    ? `${Math.floor(secondsAgo / 60)}m ago`
                    : `${Math.floor(secondsAgo / 3600)}h ago`

              return (
                <TableRow key={tx.signature}>
                  <TableCell className="font-mono text-xs">
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
                    >
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://explorer.solana.com/block/${tx.slot}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
                    >
                      {tx.slot.toLocaleString()}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.status === "Success" ? "outline" : "destructive"}
                      className={
                        tx.status === "Success"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                          : ""
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{timeAgo}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
