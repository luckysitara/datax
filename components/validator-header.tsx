"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useValidator } from "@/lib/hooks/use-validator"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export function ValidatorHeader({ validatorId }: { validatorId: string }) {
  const { data: validator, isLoading } = useValidator(validatorId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!validator) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Validator Not Found</h2>
              <p className="text-sm text-muted-foreground">The validator with ID {validatorId} could not be found.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/validators">Back to Validators</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{validator.name || `Validator ${validatorId.slice(0, 8)}`}</h2>
              {validator.delinquent ? (
                <Badge variant="destructive">Delinquent</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{validatorId}</p>
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0" asChild>
                <a
                  href={`https://explorer.solana.com/address/${validatorId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="sr-only">View on Solana Explorer</span>
                </a>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col items-center rounded-md border p-2 md:min-w-24">
              <span className="text-xs text-muted-foreground">Commission</span>
              <span className="text-lg font-bold">{validator.commission}%</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2 md:min-w-24">
              <span className="text-xs text-muted-foreground">APY</span>
              <span className="text-lg font-bold">{validator.apy?.toFixed(2)}%</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2 md:min-w-24">
              <span className="text-xs text-muted-foreground">Score</span>
              <span className="text-lg font-bold">{validator.performance_score?.toFixed(1)}</span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-2 md:min-w-24">
              <span className="text-xs text-muted-foreground">Stake</span>
              <span className="text-lg font-bold">
                {(validator.activated_stake / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M
              </span>
            </div>
            <Button>Stake with Validator</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
