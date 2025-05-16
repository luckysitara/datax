import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StakePage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Stake</h1>
      </div>

      <Tabs defaultValue="stake">
        <TabsList>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="unstake">Unstake</TabsTrigger>
          <TabsTrigger value="redelegate">Redelegate</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stake SOL</CardTitle>
              <CardDescription>Stake your SOL to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (SOL)</Label>
                <Input id="amount" placeholder="Enter amount" type="number" min="0" step="0.1" />
                <p className="text-xs text-muted-foreground">Available balance: 100 SOL</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validator">Validator</Label>
                <Input id="validator" placeholder="Enter validator address or search by name" />
                <p className="text-xs text-muted-foreground">Select a validator to stake with</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Stake SOL</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="unstake" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unstake SOL</CardTitle>
              <CardDescription>Unstake your SOL from validators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unstake-validator">Validator</Label>
                <Input id="unstake-validator" placeholder="Select staked validator" />
                <p className="text-xs text-muted-foreground">Select a validator you have staked with</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unstake-amount">Amount (SOL)</Label>
                <Input id="unstake-amount" placeholder="Enter amount" type="number" min="0" step="0.1" />
                <p className="text-xs text-muted-foreground">Staked balance: 50 SOL</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Unstake SOL</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="redelegate" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redelegate Stake</CardTitle>
              <CardDescription>Move your stake from one validator to another</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-validator">From Validator</Label>
                <Input id="from-validator" placeholder="Select current validator" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-validator">To Validator</Label>
                <Input id="to-validator" placeholder="Select new validator" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redelegate-amount">Amount (SOL)</Label>
                <Input id="redelegate-amount" placeholder="Enter amount" type="number" min="0" step="0.1" />
                <p className="text-xs text-muted-foreground">Staked balance: 50 SOL</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Redelegate Stake</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
