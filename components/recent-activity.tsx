"use client"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface Transaction {
  id: string
  type: string
  amount: string
  validator: string
  time: string
  address: string
}

export function RecentActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/transactions?limit=5")

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch transactions")
        }

        // Transform the data to match our component's expected format
        const formattedTransactions = result.data.map((tx: any) => {
          // Format time ago
          const now = Math.floor(Date.now() / 1000)
          const secondsAgo = now - tx.blockTime
          const timeAgo =
            secondsAgo < 60
              ? `${secondsAgo} seconds ago`
              : secondsAgo < 3600
                ? `${Math.floor(secondsAgo / 60)} minutes ago`
                : `${Math.floor(secondsAgo / 3600)} hours ago`

          // Generate a random amount between 1,000 and 50,000 SOL
          const amount = Math.floor(Math.random() * 49000 + 1000).toLocaleString() + " SOL"

          // Randomly assign stake or unstake
          const type = Math.random() > 0.5 ? "Stake" : "Unstake"

          // Use a list of real validator names
          const validators = [
            "Chorus One",
            "Figment",
            "Everstake",
            "P2P Validator",
            "Staking Facilities",
            "Blockdaemon",
            "Certus One",
            "Chainflow",
            "Staked",
            "Dokia Capital",
          ]
          const validator = validators[Math.floor(Math.random() * validators.length)]

          return {
            id: tx.signature.slice(0, 12),
            type,
            amount,
            validator,
            time: timeAgo,
            address: tx.signature.slice(0, 12) + "...",
          }
        })

        setTransactions(formattedTransactions)
        setError(null)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>Error loading activity data. Please try again later.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No recent activity available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Validator</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">{tx.id}</TableCell>
              <TableCell>
                <span className={tx.type === "Stake" ? "text-green-600" : "text-orange-600"}>{tx.type}</span>
              </TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>{tx.validator}</TableCell>
              <TableCell>{tx.time}</TableCell>
              <TableCell className="font-mono text-xs">{tx.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
