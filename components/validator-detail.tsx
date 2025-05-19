import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getValidatorById, getValidatorHistory, getValidatorRewards, getValidatorRisk } from "@/app/actions/validators"
import { formatNumber, formatPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, Shield, Zap } from "lucide-react"

export async function ValidatorDetail({ pubkey }: { pubkey: string }) {
  const { success: validatorSuccess, data: validator, error: validatorError } = await getValidatorById(pubkey)
  const { success: historySuccess, data: history } = await getValidatorHistory(pubkey, 5)
  const { success: rewardsSuccess, data: rewards } = await getValidatorRewards(pubkey, 5)
  const { success: riskSuccess, data: risks } = await getValidatorRisk(pubkey, 1)

  if (!validatorSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validator Not Found</CardTitle>
          <CardDescription>{validatorError}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const risk = riskSuccess && risks.length > 0 ? risks[0] : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{validator.name}</CardTitle>
              <CardDescription className="mt-1">{validator.pubkey}</CardDescription>
            </div>
            {validator.delinquent ? (
              <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Delinquent
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center bg-green-500 text-white">
                <CheckCircle className="mr-1 h-4 w-4" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Activated Stake</p>
              <p className="text-2xl font-bold">{formatNumber(validator.activated_stake / 1e9)} SOL</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Commission</p>
              <p className="text-2xl font-bold">{formatPercentage(validator.commission / 100)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">APY</p>
              <p className="text-2xl font-bold">{formatPercentage(validator.apy / 100)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Performance Score</span>
                </div>
                <span className="font-medium">
                  {validator.performance_score ? validator.performance_score.toFixed(1) : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Risk Score</span>
                </div>
                <span className="font-medium">{validator.risk_score ? validator.risk_score.toFixed(1) : "N/A"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Vote</span>
                </div>
                <span className="font-medium">{validator.last_vote ? `Slot ${validator.last_vote}` : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {!risk ? (
              <p className="text-sm text-muted-foreground">No risk data available</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delinquency Risk</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${risk.delinquency_risk || 0}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Concentration Risk</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${risk.concentration_risk || 0}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime Risk</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${risk.uptime_risk || 0}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Last 5 epochs</CardDescription>
        </CardHeader>
        <CardContent>
          {!historySuccess || history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No historical data available</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-sm font-medium">
                <div>Epoch</div>
                <div>Commission</div>
                <div>Performance</div>
                <div>Status</div>
              </div>
              {history.map((record) => (
                <div key={record.epoch} className="grid grid-cols-4 text-sm">
                  <div>{record.epoch}</div>
                  <div>{formatPercentage(record.commission / 100)}</div>
                  <div>{record.performance_score ? record.performance_score.toFixed(1) : "N/A"}</div>
                  <div>
                    {record.delinquent ? (
                      <Badge variant="destructive" className="text-xs">
                        Delinquent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500 text-white text-xs">
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

      <Card>
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
          <CardDescription>Last 5 epochs</CardDescription>
        </CardHeader>
        <CardContent>
          {!rewardsSuccess || rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rewards data available</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-sm font-medium">
                <div>Epoch</div>
                <div>Reward</div>
                <div>APY</div>
              </div>
              {rewards.map((record) => (
                <div key={record.epoch} className="grid grid-cols-3 text-sm">
                  <div>{record.epoch}</div>
                  <div>{record.reward ? formatNumber(record.reward / 1e9) + " SOL" : "N/A"}</div>
                  <div>{record.apy ? formatPercentage(record.apy / 100) : "N/A"}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
