import type { Metadata } from "next"
import { FetchValidatorsButton } from "@/components/fetch-validators-button"
import { TrainModelButton } from "@/components/train-model-button"
import { createServerSupabaseClient } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "Settings | Solana Stake Dashboard",
  description: "Manage your Solana staking dashboard settings",
}

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()

  // Get the latest epoch info
  const { data: epochInfo } = await supabase
    .from("epoch_info")
    .select("*")
    .order("epoch", { ascending: false })
    .limit(1)
    .single()
    .catch(() => ({ data: null }))

  // Get validator count
  const { count: validatorCount } = await supabase
    .from("validators")
    .select("*", { count: "exact", head: true })
    .catch(() => ({ count: 0 }))

  // Get last updated time
  const { data: lastUpdated } = await supabase
    .from("validators")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()
    .catch(() => ({ data: null }))

  // Get model predictions count
  const { count: predictionsCount } = await supabase
    .from("model_predictions")
    .select("*", { count: "exact", head: true })
    .catch(() => ({ count: 0 }))

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Validator Data</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Epoch:</span>
              <span className="font-medium">{epochInfo?.epoch || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validators:</span>
              <span className="font-medium">{validatorCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">
                {lastUpdated?.updated_at ? new Date(lastUpdated.updated_at).toLocaleString() : "Never"}
              </span>
            </div>
          </div>
          <FetchValidatorsButton />
          <p className="mt-4 text-sm text-muted-foreground">
            Fetches the latest validator data from the Solana network and updates the database. This process may take
            several minutes.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Model Training</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Predictions:</span>
              <span className="font-medium">{predictionsCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Epoch:</span>
              <span className="font-medium">{epochInfo ? epochInfo.epoch + 1 : "Unknown"}</span>
            </div>
          </div>
          <TrainModelButton />
          <p className="mt-4 text-sm text-muted-foreground">
            Trains the prediction model using the latest validator data and generates predictions for the next epoch.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
        <p className="text-muted-foreground mb-4">Configure advanced settings for your Solana staking dashboard.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Data Retention</h3>
            <p className="text-sm text-muted-foreground">Control how long historical data is kept in the database.</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">API Access</h3>
            <p className="text-sm text-muted-foreground">
              Manage API keys and access controls for external applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
