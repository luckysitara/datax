import { Suspense } from "react"
import { ArrowLeft, Filter, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValidatorTable } from "@/components/validator-table"
import { ValidatorFilters } from "@/components/validator-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function ValidatorsPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Validator Explorer</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64 lg:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search validators..."
              className="w-full bg-background pl-8 md:w-64 lg:w-80"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">View options</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine validator results</CardDescription>
          </CardHeader>
          <CardContent>
            <ValidatorFilters />
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Validators</TabsTrigger>
                <TabsTrigger value="top">Top Performers</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="delinquent">Delinquent</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Validators</CardTitle>
                  <CardDescription>Complete list of validators on the Solana network</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                    <ValidatorTable />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="top" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Validators</CardTitle>
                  <CardDescription>Validators with the highest performance scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                    <ValidatorTable filter="top" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recommended" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Validators</CardTitle>
                  <CardDescription>Validators with optimal balance of performance and risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                    <ValidatorTable filter="recommended" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="delinquent" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Delinquent Validators</CardTitle>
                  <CardDescription>Validators that are currently delinquent</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                    <ValidatorTable filter="delinquent" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
