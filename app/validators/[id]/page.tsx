import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, ExternalLink, LineChart, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ValidatorHeader } from "@/components/validator-header"
import { ValidatorPerformance } from "@/components/validator-performance"
import { ValidatorRewards } from "@/components/validator-rewards"
import { ValidatorRisk } from "@/components/validator-risk"
import { ValidatorPrediction } from "@/components/validator-prediction"

export default function ValidatorPage({ params }: { params: { id: string } }) {
  const validatorId = params.id

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/validators">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Validators</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Validator Details</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
        <ValidatorHeader validatorId={validatorId} />
      </Suspense>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Performance Score</CardTitle>
                  <CardDescription>Overall validator rating</CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
                  <ValidatorPerformance validatorId={validatorId} />
                </Suspense>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Reward Prediction</CardTitle>
                  <CardDescription>Estimated future rewards</CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
                  <ValidatorPrediction validatorId={validatorId} />
                </Suspense>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Slashing and delinquency risk</CardDescription>
                </div>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
                  <ValidatorRisk validatorId={validatorId} />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Validator Summary</CardTitle>
              <CardDescription>Key metrics and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <ValidatorRewards validatorId={validatorId} />
              </Suspense>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto" asChild>
                <a
                  href={`https://explorer.solana.com/address/${validatorId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Solana Explorer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <ValidatorPerformance validatorId={validatorId} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>Historical and projected rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <ValidatorRewards validatorId={validatorId} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risk" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Comprehensive risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <ValidatorRisk validatorId={validatorId} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
