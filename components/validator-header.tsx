import { formatNumber, formatPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"

async function getValidatorDetails(validatorId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/validators/${validatorId}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch validator: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      throw new Error("Invalid response format")
    }

    return data.data.validator
  } catch (error) {
    console.error("Error fetching validator details:", error)
    return null
  }
}

export async function ValidatorHeader({ validatorId }: { validatorId: string }) {
  const validator = await getValidatorDetails(validatorId)

  if (!validator) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Validator Not Found</h2>
            <p className="text-muted-foreground">The requested validator could not be found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{validator.name}</h2>
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
          <p className="text-sm text-muted-foreground">{validator.pubkey}</p>
          {validator.vote_pubkey && (
            <p className="text-xs text-muted-foreground">Vote Account: {validator.vote_pubkey}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-4 md:gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Stake</p>
            <p className="text-xl font-bold">{formatNumber(validator.activated_stake / 1e9)} SOL</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Commission</p>
            <p className="text-xl font-bold">{formatPercentage(validator.commission / 100)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="text-xl font-bold">{formatPercentage(validator.apy)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
