import { NextResponse } from "next/server"
import { fetchAllValidatorData, storeValidatorData } from "@/utils/fetch-solana-validators"

export const maxDuration = 300 // 5 minutes max duration for this API route

export async function POST() {
  try {
    console.log("Starting validator data fetch...")

    // Fetch validator data from Solana
    const data = await fetchAllValidatorData()
    console.log(`Fetched ${data.totalValidators} validators for epoch ${data.epoch}`)

    // Store data in Supabase
    const result = await storeValidatorData(data)

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and stored ${result.count} validators`,
      totalValidators: data.totalValidators,
      epoch: data.epoch,
    })
  } catch (error) {
    console.error("Error fetching validator data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validator data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
