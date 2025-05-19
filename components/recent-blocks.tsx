"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatTimeAgo, shortenAddress } from "@/lib/utils"

export function RecentBlocks({ limit = 5 }: { limit?: number }) {
  const [blocks, setBlocks] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const response = await fetch(`/api/blocks?limit=${limit}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch blocks: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error("Invalid response format")
        }

        setBlocks(result.data)
      } catch (error) {
        console.error("Error fetching recent blocks:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchBlocks()

    // Refresh every 30 seconds
    const interval = setInterval(fetchBlocks, 30000)
    return () => clearInterval(interval)
  }, [limit])

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error || !blocks) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load recent blocks: {error}</p>
      </div>
    )
  }

  if (blocks.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No blocks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <div key={block.slot} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Slot {formatNumber(block.slot)}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {block.block_time ? formatTimeAgo(block.block_time) : "Unknown time"}
              </p>
              {block.leader && (
                <p className="text-xs text-muted-foreground">Leader: {shortenAddress(block.leader, 4)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <div>{formatNumber(block.transactions)}</div>
              <div className="text-xs text-muted-foreground">Transactions</div>
            </div>
            <div className="text-sm text-right">
              <div>{(block.fees / 1e9).toFixed(6)} SOL</div>
              <div className="text-xs text-muted-foreground">Fees</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
