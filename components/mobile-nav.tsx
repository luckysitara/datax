"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <span className="font-bold">Solana Validator Analytics</span>
        </Link>
        <nav className="mt-6 flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname === "/" && "text-foreground font-medium",
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/validators"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/validators") && "text-foreground font-medium",
            )}
          >
            Validators
          </Link>
          <Link
            href="/blocks"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/blocks") && "text-foreground font-medium",
            )}
          >
            Blocks
          </Link>
          <Link
            href="/transactions"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/transactions") && "text-foreground font-medium",
            )}
          >
            Transactions
          </Link>
          <Link
            href="/analytics"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground",
              pathname?.startsWith("/analytics") && "text-foreground font-medium",
            )}
          >
            Analytics
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
