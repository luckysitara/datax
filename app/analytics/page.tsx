import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RewardTrend } from "@/components/reward-trend"
import { StakeDistribution } from "@/components/stake-distribution"
import { RiskAssessment } from "@/components/risk-assessment"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | Solana Stake Dashboard",
  description: "Analytics and insights for Solana staking",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights and trends for Solana staking</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="col-span-2">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RewardTrend />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <StakeDistribution />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RiskAssessment />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
