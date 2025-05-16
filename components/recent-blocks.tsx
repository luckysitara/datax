"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Block {
  slot: number
  blockTime: number
  blockHeight: number | null
  validator: string
  transactions: number | null
  totalFees: number | null
}

export function RecentBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchBlocks = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/blocks?limit=10")

      if (!response.ok) {
        throw new Error(`Failed to fetch blocks: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch blocks")
      }

      setBlocks(result.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching blocks:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBlocks()

    // Refresh data every 2 minutes to reduce API calls
    const intervalId = setInterval(fetchBlocks, 120000)

    return () => clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Recent Blocks</h3>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Blocks</h3>
        <Button variant="outline" size="sm" onClick={fetchBlocks} disabled={isRefreshing}>
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to fetch recent blocks: {error.message}. Please try again later.</AlertDescription>
        </Alert>
      )}

      {blocks.length === 0 && !error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No block data available. Please try refreshing.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Validator</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Fees (SOL)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => {
                // Format time ago
                const now = Math.floor(Date.now() / 1000)
                const secondsAgo = now - block.blockTime
                const timeAgo =
                  secondsAgo < 60
                    ? `${secondsAgo}s ago`
                    : secondsAgo < 3600
                      ? `${Math.floor(secondsAgo / 60)}m ago`
                      : `${Math.floor(secondsAgo / 3600)}h ago`

                // Format date/time
                const date = new Date(block.blockTime * 1000)
                const formattedTime = date.toLocaleTimeString()

                return (
                  <TableRow key={block.slot}>
                    <TableCell>
                      <a
                        href={`https://explorer.solana.com/block/${block.slot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600"
                      >
                        {block.slot.toLocaleString()}
                      </a>
                    </TableCell>
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell>{timeAgo}</TableCell>
                    <TableCell>{block.validator || "Unknown"}</TableCell>
                    <TableCell>{block.transactions?.toLocaleString() || "N/A"}</TableCell>
                    <TableCell>{block.totalFees?.toFixed(6) || "N/A"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
