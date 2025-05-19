import { NextResponse } from "next/server"
import { fetchAndStoreValidatorData } from "@/utils/fetch-validators"

export const maxDuration = 300 // 5 minutes max duration for this API route

export async function POST() {
  try {
    console.log("Starting validator data fetch...")

    // Fetch and store validator data
    const result = await fetchAndStoreValidatorData()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch validator data")
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and stored ${result.storedValidators} validators`,
      totalValidators: result.totalValidators,
      epoch: result.epoch,
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
