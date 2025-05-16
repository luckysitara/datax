"use client"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export function ValidatorFilters() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Commission Rate</h3>
        <div className="space-y-4">
          <Slider defaultValue={[10]} max={100} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>Max: 10%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Minimum APY</h3>
        <div className="space-y-4">
          <Slider defaultValue={[5]} max={10} step={0.1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>Min: 5%</span>
            <span>10%</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Risk Tolerance</h3>
        <div className="space-y-4">
          <Slider defaultValue={[30]} max={100} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="hide-delinquent" className="text-sm font-medium">
            Hide Delinquent
          </Label>
          <Switch id="hide-delinquent" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="only-recommended" className="text-sm font-medium">
            Only Recommended
          </Label>
          <Switch id="only-recommended" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-superminority" className="text-sm font-medium">
            Show Superminority
          </Label>
          <Switch id="show-superminority" />
        </div>
      </div>

      <Separator />

      <Button className="w-full">Apply Filters</Button>
    </div>
  )
}
