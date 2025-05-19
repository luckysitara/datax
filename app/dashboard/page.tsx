import { DashboardOverview } from "@/components/dashboard-overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getAllValidators } from "../actions/validators"
import { formatNumber, formatPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"

export default async function DashboardPage() {
  const { success, data: validators, count } = await getAllValidators(10)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solana Validator Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze Solana validator performance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/api/seed">Seed Database</Link>
          </Button>
        </div>
      </div>

      <DashboardOverview />

      <Card>
        <CardHeader>
          <CardTitle>All Validators</CardTitle>
          <CardDescription>
            {success ? `Showing ${validators.length} of ${count} validators` : "Error loading validators"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <p className="text-sm text-muted-foreground">Error loading validators</p>
          ) : validators.length === 0 ? (
            <p className="text-sm text-muted-foreground">No validators found</p>
          ) : (
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
                    <div className="font-medium">{validator.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{validator.pubkey}</div>
                  </div>
                  <div className="text-right">{formatNumber(validator.activated_stake / 1e9)} SOL</div>
                  <div className="text-right">{formatPercentage(validator.commission / 100)}</div>
                  <div className="text-right">{formatPercentage(validator.apy / 100)}</div>
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
          )}

          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/validators">
                View All Validators <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
