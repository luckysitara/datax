"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { formatPercentage } from "@/lib/utils"

export function ValidatorFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial values from URL params
  const initialCommissionRange = [
    Number(searchParams.get("minCommission") || 0),
    Number(searchParams.get("maxCommission") || 100),
  ]

  const initialApyRange = [Number(searchParams.get("minApy") || 0), Number(searchParams.get("maxApy") || 10)]

  const initialShowDelinquent = searchParams.get("showDelinquent") !== "false"

  // State for filter values
  const [commissionRange, setCommissionRange] = useState(initialCommissionRange)
  const [apyRange, setApyRange] = useState(initialApyRange)
  const [showDelinquent, setShowDelinquent] = useState(initialShowDelinquent)

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    params.set("minCommission", commissionRange[0].toString())
    params.set("maxCommission", commissionRange[1].toString())
    params.set("minApy", apyRange[0].toString())
    params.set("maxApy", apyRange[1].toString())
    params.set("showDelinquent", showDelinquent.toString())

    router.push(`/validators?${params.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setCommissionRange([0, 100])
    setApyRange([0, 10])
    setShowDelinquent(true)

    router.push("/validators")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Commission Range</Label>
          <span className="text-xs text-muted-foreground">
            {formatPercentage(commissionRange[0] / 100)} - {formatPercentage(commissionRange[1] / 100)}
          </span>
        </div>
        <Slider value={commissionRange} min={0} max={100} step={1} onValueChange={setCommissionRange} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>APY Range</Label>
          <span className="text-xs text-muted-foreground">
            {formatPercentage(apyRange[0] / 100)} - {formatPercentage(apyRange[1] / 100)}
          </span>
        </div>
        <Slider value={apyRange} min={0} max={10} step={0.1} onValueChange={setApyRange} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="show-delinquent" checked={showDelinquent} onCheckedChange={setShowDelinquent} />
        <Label htmlFor="show-delinquent">Show Delinquent Validators</Label>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
