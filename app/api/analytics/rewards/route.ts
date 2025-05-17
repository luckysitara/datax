import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Generate realistic reward trend data
    // This is static data to avoid RPC calls
    const data = [
      { epoch: 1, avgReward: 5.8, topReward: 7.2, minReward: 4.5 },
      { epoch: 2, avgReward: 5.9, topReward: 7.3, minReward: 4.6 },
      { epoch: 3, avgReward: 6.0, topReward: 7.4, minReward: 4.7 },
      { epoch: 4, avgReward: 6.1, topReward: 7.5, minReward: 4.8 },
      { epoch: 5, avgReward: 6.2, topReward: 7.6, minReward: 4.9 },
      { epoch: 6, avgReward: 6.3, topReward: 7.7, minReward: 5.0 },
      { epoch: 7, avgReward: 6.4, topReward: 7.8, minReward: 5.1 },
      { epoch: 8, avgReward: 6.5, topReward: 7.9, minReward: 5.2 },
      { epoch: 9, avgReward: 6.6, topReward: 8.0, minReward: 5.3 },
      { epoch: 10, avgReward: 6.7, topReward: 8.1, minReward: 5.4 },
      { epoch: 11, avgReward: 6.8, topReward: 8.2, minReward: 5.5 },
      { epoch: 12, avgReward: 6.9, topReward: 8.3, minReward: 5.6 },
    ]

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error generating reward trends:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate reward trends",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
