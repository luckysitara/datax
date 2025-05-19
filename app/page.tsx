import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NetworkStats } from "@/components/network-stats"
import { ValidatorStats } from "@/components/validator-stats"
import { RecentBlocks } from "@/components/recent-blocks"
import { RecentTransactions } from "@/components/recent-transactions"
import { TopValidators } from "@/components/top-validators"
import { RewardTrend } from "@/components/reward-trend"
import { StakeDistribution } from "@/components/stake-distribution"

export const metadata = {
  title: "Solana Validator Dashboard",
  description: "Analytics dashboard for Solana validators",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <NetworkStats />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <ValidatorStats />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Top Validators</CardTitle>
                  <CardDescription>The highest performing validators on the network</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopValidators />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Blocks</CardTitle>
                  <CardDescription>The most recently produced blocks</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentBlocks />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>The most recent transactions on the network</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Stake Distribution</CardTitle>
                  <CardDescription>Distribution of stake across validators</CardDescription>
                </CardHeader>
                <CardContent>
                  <StakeDistribution />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Reward Trend</CardTitle>
                  <CardDescription>Historical APY and rewards over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <RewardTrend />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Stake Distribution</CardTitle>
                  <CardDescription>Distribution of stake across validators</CardDescription>
                </CardHeader>
                <CardContent>
                  <StakeDistribution />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
