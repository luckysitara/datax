import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function SecurityPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Security</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
          <CardDescription>Overview of your staking security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium">Security Score</span>
            </div>
            <div className="text-xl font-bold">85/100</div>
          </div>
          <Progress value={85} className="h-2 w-full" />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Validator Diversification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Good</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Staked with 5 validators</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Delinquent Exposure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Medium</span>
                  </div>
                  <span className="text-sm text-muted-foreground">10% staked with delinquent validators</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Concentration Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Medium</span>
                  </div>
                  <span className="text-sm text-muted-foreground">60% staked with top validator</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Commission Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Low</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Average commission: 5%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Recommendations to improve your staking security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Reduce stake with delinquent validators</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You have 10% of your stake with delinquent validators. Consider moving this stake to active validators.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              View Delinquent Validators
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Diversify your stake</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You have 60% of your stake with a single validator. Consider spreading your stake across more validators.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              View Recommended Validators
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
