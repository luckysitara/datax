import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, LineChart, PieChart, Activity, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ValidatorStats } from "@/components/validator-stats"
import { RewardTrend } from "@/components/reward-trend"
import { StakeDistribution } from "@/components/stake-distribution"
import { TrainModelButton } from "@/components/train-model-button"
import { NetworkStats } from "@/components/network-stats"
import { RecentTransactions } from "@/components/recent-transactions"
import { RecentBlocks } from "@/components/recent-blocks"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export default function HomePage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Validator Performance & Reward Analyzer</h1>
          <p className="text-muted-foreground">
            Make informed staking decisions with real-time validator analytics and predictions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrainModelButton />
          <Button asChild variant="outline">
            <Link href="/validators">
              View All Validators
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <ConnectWalletButton />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
        <NetworkStats />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <ValidatorStats />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Reward Trends</CardTitle>
              <CardDescription>Average validator rewards over time</CardDescription>
            </div>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <RewardTrend />
            </Suspense>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href="/analytics">
                View Detailed Analysis
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Stake Distribution</CardTitle>
              <CardDescription>Current stake allocation across validators</CardDescription>
            </div>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <StakeDistribution />
            </Suspense>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href="/analytics">
                View Detailed Analysis
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest transactions on the Solana network</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <RecentTransactions />
            </Suspense>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href="/transactions">
                View All Transactions
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Blocks</CardTitle>
              <CardDescription>Latest blocks produced on the Solana network</CardDescription>
            </div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <RecentBlocks />
            </Suspense>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href="/blocks">
                View All Blocks
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
