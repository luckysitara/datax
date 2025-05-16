"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Settings, Users, Activity, Layers, Shield, HelpCircle } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/validators",
      label: "Validators",
      icon: Users,
      active: pathname === "/validators" || pathname.startsWith("/validators/"),
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname === "/analytics",
    },
    {
      href: "/activity",
      label: "Activity",
      icon: Activity,
      active: pathname === "/activity",
    },
    {
      href: "/stake",
      label: "Stake",
      icon: Layers,
      active: pathname === "/stake",
    },
    {
      href: "/security",
      label: "Security",
      icon: Shield,
      active: pathname === "/security",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
    {
      href: "/help",
      label: "Help",
      icon: HelpCircle,
      active: pathname === "/help",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Button key={route.href} variant={route.active ? "default" : "ghost"} size="sm" asChild>
          <Link
            href={route.href}
            className={cn(
              "flex items-center gap-2",
              route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
            )}
          >
            <route.icon className="h-4 w-4" />
            <span className="hidden md:inline-block">{route.label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  )
}
