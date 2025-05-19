import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTopValidators } from "@/app/actions/validators"
import { formatNumber, formatPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react"

export async function DashboardOverview() {
  const { success, data: validators, error } = await getTopValidators(5)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stake</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {success
              ? formatNumber(validators.reduce((sum, v) => sum + v.activated_stake / 1e9, 0)) + " SOL"
              : "Error loading data"}
          </div>
          <p className="text-xs text-muted-foreground">
            {success ? `Across ${validators.length} top validators` : error}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average APY</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {success
              ? formatPercentage(validators.reduce((sum, v) => sum + v.apy, 0) / validators.length / 100)
              : "Error loading data"}
          </div>
          <p className="text-xs text-muted-foreground">{success ? "Average across top validators" : error}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Commission</CardTitle>
          <div className="h-4 w-4 text-muted-foreground">%</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {success
              ? formatPercentage(validators.reduce((sum, v) => sum + v.commission, 0) / validators.length / 100)
              : "Error loading data"}
          </div>
          <p className="text-xs text-muted-foreground">{success ? "Average across top validators" : error}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Validators</CardTitle>
          <CardDescription>Top validators by activated stake</CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <p className="text-sm text-muted-foreground">{error || "Error loading validators"}</p>
          ) : validators.length === 0 ? (
            <p className="text-sm text-muted-foreground">No validators found</p>
          ) : (
            <div className="space-y-4">
              {validators.map((validator) => (
                <div key={validator.pubkey} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{validator.name}</p>
                    <p className="text-xs text-muted-foreground">{validator.pubkey.substring(0, 8)}...</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-right">
                      <div>{formatNumber(validator.activated_stake / 1e9)} SOL</div>
                      <div className="text-xs text-muted-foreground">Stake</div>
                    </div>
                    <div className="text-sm text-right">
                      <div>{formatPercentage(validator.apy / 100)}</div>
                      <div className="text-xs text-muted-foreground">APY</div>
                    </div>
                    {validator.delinquent ? (
                      <Badge variant="destructive" className="flex items-center">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Delinquent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center bg-green-500 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
