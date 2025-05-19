import Link from "next/link"
import { formatNumber, formatPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function getValidators(filter = "all") {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/validators?limit=50&filter=${filter}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch validators: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      throw new Error("Invalid response format")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching validators:", error)
    return null
  }
}

export async function ValidatorTable({ filter = "all" }: { filter?: string }) {
  const validators = await getValidators(filter)

  if (!validators) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load validators</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Pubkey</TableHead>
          <TableHead className="text-right">Stake (SOL)</TableHead>
          <TableHead className="text-right">Commission</TableHead>
          <TableHead className="text-right">APY</TableHead>
          <TableHead className="text-right">Performance</TableHead>
          <TableHead className="text-right">Risk</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {validators.map((validator: any) => (
          <TableRow key={validator.pubkey}>
            <TableCell className="font-medium">
              <Link href={`/validators/${validator.pubkey}`} className="hover:underline">
                {validator.name}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {validator.pubkey.substring(0, 8)}...{validator.pubkey.substring(validator.pubkey.length - 8)}
            </TableCell>
            <TableCell className="text-right">{formatNumber(validator.activated_stake / 1e9)}</TableCell>
            <TableCell className="text-right">{formatPercentage(validator.commission / 100)}</TableCell>
            <TableCell className="text-right">{formatPercentage(validator.apy / 100)}</TableCell>
            <TableCell className="text-right">{validator.performance_score.toFixed(1)}</TableCell>
            <TableCell className="text-right">{validator.risk_score.toFixed(1)}</TableCell>
            <TableCell className="text-right">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
