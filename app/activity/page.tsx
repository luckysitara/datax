import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ActivityPage() {
  // Generate some fake activity data
  const activities = Array.from({ length: 20 }, (_, i) => {
    const types = ["Stake", "Unstake", "Reward", "Commission Change", "Delinquency", "Vote"]
    const type = types[Math.floor(Math.random() * types.length)]

    const validators = [
      "Chorus One #a1b2",
      "Figment #c3d4",
      "Everstake #e5f6",
      "P2P Validator #g7h8",
      "Staking Facilities #i9j0",
    ]
    const validator = validators[Math.floor(Math.random() * validators.length)]

    const amounts =
      type === "Stake" || type === "Unstake"
        ? `${(Math.random() * 100).toFixed(2)} SOL`
        : type === "Reward"
          ? `${(Math.random() * 1).toFixed(4)} SOL`
          : type === "Commission Change"
            ? `${Math.floor(Math.random() * 10)}% → ${Math.floor(Math.random() * 10)}%`
            : ""

    const date = new Date()
    date.setHours(date.getHours() - i)

    return {
      id: i,
      type,
      validator,
      amount: amounts,
      date: date.toLocaleString(),
    }
  })

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Activity</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent activity on the Solana network related to staking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Validator</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.type}</TableCell>
                  <TableCell>{activity.validator}</TableCell>
                  <TableCell>{activity.amount}</TableCell>
                  <TableCell>{activity.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
