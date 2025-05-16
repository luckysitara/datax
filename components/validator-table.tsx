"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useValidatorData } from "@/lib/hooks/use-validator-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ValidatorTableProps {
  filter?: "all" | "top" | "recommended" | "delinquent"
}

export function ValidatorTable({ filter = "all" }: ValidatorTableProps) {
  const { data, isLoading, error } = useValidatorData(filter)
  const [sortField, setSortField] = useState<string>("performance_score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load validator data: {error.message}. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No validator data available. Please try refreshing the data using the button above.
        </AlertDescription>
      </Alert>
    )
  }

  // Sort validators
  const sortedValidators = [...data].sort((a, b) => {
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

  // Paginate validators
  const totalPages = Math.ceil(sortedValidators.length / pageSize)
  const paginatedValidators = sortedValidators.slice((page - 1) * pageSize, page * pageSize)

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
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("activated_stake")}>
                Stake
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("performance_score")}>
                Score
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("risk_score")}>
                Risk
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedValidators.map((validator) => (
            <TableRow key={validator.pubkey}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{validator.name || `Validator ${validator.pubkey.slice(0, 4)}`}</span>
                  <span className="text-xs text-muted-foreground">{validator.pubkey.slice(0, 8)}...</span>
                </div>
              </TableCell>
              <TableCell>{validator.commission}%</TableCell>
              <TableCell>{validator.apy?.toFixed(2)}%</TableCell>
              <TableCell>
                {(validator.activated_stake / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                SOL
              </TableCell>
              <TableCell>{validator.performance_score?.toFixed(1)}</TableCell>
              <TableCell>
                <RiskBadge score={validator.risk_score || 0} />
              </TableCell>
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/validators/${validator.pubkey}`}>Details</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) setPage(page - 1)
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1

            // Adjust page numbers for pagination with ellipsis
            if (totalPages > 5) {
              if (page > 3 && page <= totalPages - 2) {
                pageNum = page + i - 2
              } else if (page > totalPages - 2) {
                pageNum = totalPages - 4 + i
              }
            }

            return (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(pageNum)
                  }}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          {totalPages > 5 && page < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page < totalPages) setPage(page + 1)
              }}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

function RiskBadge({ score }: { score: number }) {
  if (score < 20) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        Low
      </Badge>
    )
  } else if (score < 50) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
        Medium
      </Badge>
    )
  } else {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700">
        High
      </Badge>
    )
  }
}
