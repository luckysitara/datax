import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Overview</CardTitle>
              <CardDescription>Key metrics about the Solana network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total Validators</div>
                  <div className="text-2xl font-bold">1,000</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Active Stake</div>
                  <div className="text-2xl font-bold">350M SOL</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Average APY</div>
                  <div className="text-2xl font-bold">6.5%</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Current Epoch</div>
                  <div className="text-2xl font-bold">420</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stake Distribution</CardTitle>
                <CardDescription>Distribution of stake across validators</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">Stake distribution chart will appear here</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validator Growth</CardTitle>
                <CardDescription>Growth of validators over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">Validator growth chart will appear here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rewards Analysis</CardTitle>
              <CardDescription>Analysis of staking rewards across the network</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground">Rewards analysis charts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Performance metrics for validators</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground">Performance metrics charts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Risk assessment for validators</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground">Risk assessment charts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
