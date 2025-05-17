"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Block {
  slot: number
  blockhash: string
  parentSlot: number
  blockTime: number
  blockHeight: number | null
  validator: string
}

export function RecentBlocks({ limit = 5 }: { limit?: number }) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchBlocks = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/blocks?limit=${limit}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch blocks: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch blocks")
      }

      setBlocks(result.data)
      setError(null)
      setLastUpdated(new Date())
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

    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchBlocks, 10 * 60 * 1000)

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
          Failed to load blocks: {error.message}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchBlocks} disabled={isRefreshing}>
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

  if (blocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No blocks found.</p>
        <Button variant="outline" size="sm" onClick={fetchBlocks} className="mt-4" disabled={isRefreshing}>
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
          <span className="text-sm text-muted-foreground">Showing {blocks.length} blocks</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
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
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slot</TableHead>
              <TableHead>Block Time</TableHead>
              <TableHead>Validator</TableHead>
              <TableHead>Block Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.slot}>
                <TableCell className="font-medium">{block.slot}</TableCell>
                <TableCell>{block.blockTime ? new Date(block.blockTime * 1000).toLocaleString() : "N/A"}</TableCell>
                <TableCell>{block.validator}</TableCell>
                <TableCell className="font-mono text-xs truncate max-w-[200px]">{block.blockhash}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
