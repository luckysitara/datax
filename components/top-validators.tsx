"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { formatNumber, shortenAddress } from "@/lib/utils"

export function TopValidators({ limit = 10 }: { limit?: number }) {
  const [validators, setValidators] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchValidators() {
      try {
        const response = await fetch(`/api/validators?limit=${limit}&sort=performance_score&order=desc`)

        if (!response.ok) {
          throw new Error(`Failed to fetch validators: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error("Invalid response format")
        }

        setValidators(result.data)
      } catch (error) {
        console.error("Error fetching top validators:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchValidators()

    // Refresh every 5 minutes
    const interval = setInterval(fetchValidators, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [limit])

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (error || !validators) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load top validators: {error}</p>
      </div>
    )
  }

  if (validators.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-muted-foreground">No validators found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 p-4 font-medium border-b">
        <div className="col-span-2">Validator</div>
        <div className="text-right">Stake</div>
        <div className="text-right">Commission</div>
        <div className="text-right">APY</div>
        <div className="text-right">Status</div>
      </div>
      {validators.map((validator) => (
        <div key={validator.pubkey} className="grid grid-cols-6 p-4 border-b last:border-0 items-center">
          <div className="col-span-2">
            <Link href={`/validators/${validator.pubkey}`} className="font-medium hover:underline">
              {validator.name || `Validator ${shortenAddress(validator.pubkey, 4)}`}
            </Link>
            <div className="text-xs text-muted-foreground truncate">{shortenAddress(validator.pubkey, 8)}</div>
          </div>
          <div className="text-right">{formatNumber(validator.activated_stake / 1e9)} SOL</div>
          <div className="text-right">{validator.commission}%</div>
          <div className="text-right">{validator.apy.toFixed(2)}%</div>
          <div className="text-right">
            {validator.delinquent ? (
              <Badge variant="destructive" className="inline-flex items-center">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Delinquent
              </Badge>
            ) : (
              <Badge variant="outline" className="inline-flex items-center bg-green-500 text-white">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
