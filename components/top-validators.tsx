"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useValidatorData } from "@/lib/hooks/use-validator-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function TopValidators() {
  const { data, isLoading } = useValidatorData("top")
  const [sortField, setSortField] = useState<string>("performance_score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  // Sort validators
  const sortedValidators = [...data]
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      // Fallback for string comparison
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("commission")}>
                Commission
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("apy")}>
                APY
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("performance_score")}>
                Score
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedValidators.map((validator) => (
            <TableRow key={validator.pubkey}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{validator.name || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">{validator.pubkey.slice(0, 8)}...</span>
                </div>
              </TableCell>
              <TableCell>{validator.commission}%</TableCell>
              <TableCell>{validator.apy?.toFixed(2)}%</TableCell>
              <TableCell>{validator.performance_score?.toFixed(1)}</TableCell>
              <TableCell>
                {validator.delinquent ? (
                  <Badge variant="destructive">Delinquent</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                  >
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`https://explorer.solana.com/address/${validator.pubkey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View on Solana Explorer</span>
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/validators/${validator.pubkey}`}>
                      <span>Details</span>
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
