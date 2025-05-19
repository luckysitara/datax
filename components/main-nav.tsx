"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">Solana Validator Analytics</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/" ? "text-foreground font-medium" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/validators"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/validators") ? "text-foreground font-medium" : "text-foreground/60",
          )}
        >
          Validators
        </Link>
        <Link
          href="/blocks"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/blocks") ? "text-foreground font-medium" : "text-foreground/60",
          )}
        >
          Blocks
        </Link>
        <Link
          href="/transactions"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/transactions") ? "text-foreground font-medium" : "text-foreground/60",
          )}
        >
          Transactions
        </Link>
        <Link
          href="/analytics"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/analytics") ? "text-foreground font-medium" : "text-foreground/60",
          )}
        >
          Analytics
        </Link>
      </nav>
    </div>
  )
}
