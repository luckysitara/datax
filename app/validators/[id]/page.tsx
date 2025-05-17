import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ValidatorHeader } from "@/components/validator-header"
import { ValidatorPerformance } from "@/components/validator-performance"
import { ValidatorRewards } from "@/components/validator-rewards"
import { ValidatorPrediction } from "@/components/validator-prediction"
import { ValidatorRisk } from "@/components/validator-risk"

export default function ValidatorDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
        <ValidatorHeader validatorId={params.id} />
      </Suspense>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validator Overview</CardTitle>
              <CardDescription>Key metrics and information about this validator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                      <ValidatorPerformance validatorId={params.id} />
                    </Suspense>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                      <ValidatorRewards validatorId={params.id} />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Historical performance metrics for this validator</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ValidatorPerformance validatorId={params.id} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>Historical rewards for this validator</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ValidatorRewards validatorId={params.id} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Predictions</CardTitle>
              <CardDescription>ML-based predictions for this validator's future performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ValidatorPrediction validatorId={params.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Risk analysis for this validator</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ValidatorRisk validatorId={params.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
