"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { formatTimeAgo, shortenAddress } from "@/lib/utils"

export function RecentTransactions({ limit = 5 }: { limit?: number }) {
  const [transactions, setTransactions] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch(`/api/transactions?limit=${limit}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error("Invalid response format")
        }

        setTransactions(result.data)
      } catch (error) {
        console.error("Error fetching recent transactions:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()

    // Refresh every 30 seconds
    const interval = setInterval(fetchTransactions, 30000)
    return () => clearInterval(interval)
  }, [limit])

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error || !transactions) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load recent transactions: {error}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.signature} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{shortenAddress(tx.signature, 8)}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {tx.block_time ? formatTimeAgo(tx.block_time) : "Unknown time"}
              </p>
              <Badge variant="outline" className="text-xs">
                {tx.instruction_type || "Unknown"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <div>{(tx.fee / 1e9).toFixed(6)} SOL</div>
              <div className="text-xs text-muted-foreground">Fee</div>
            </div>
            {tx.status === "Success" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
