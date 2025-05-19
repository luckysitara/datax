import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Call the model training API
    const response = await fetch(
      new URL("/api/ml/train", process.env.VERCEL_URL || "http://localhost:3000").toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to train model: ${errorData.message || response.statusText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Scheduled model training completed",
      result,
    })
  } catch (error) {
    console.error("Error in scheduled model training:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to train model",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
