import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get reward history from database
    const { data, error } = await supabase
      .from("rewards_history")
      .select("*")
      .order("epoch", { ascending: false })
      .limit(30)

    if (error) {
      throw error
    }

    // If we have data, return it
    if (data && data.length > 0) {
      return NextResponse.json({
        success: true,
        data,
        source: "database",
      })
    }

    // Otherwise, generate mock data
    console.log("Generating mock reward data...")
    const mockData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const baseApy = 6.5 + Math.random() * 0.5 - 0.25 // 6.25% to 6.75%
      const minApy = baseApy - 0.5 - Math.random() * 0.3 // 0.5% to 0.8% lower
      const maxApy = baseApy + 0.5 + Math.random() * 0.3 // 0.5% to 0.8% higher

      return {
        epoch: 300 - i,
        time: date.toISOString(),
        avg_apy: baseApy,
        min_apy: minApy,
        max_apy: maxApy,
        avg_reward: 0.05 + Math.random() * 0.02 - 0.01, // 0.04 to 0.06 SOL
        total_rewards: 50000 + Math.random() * 10000 - 5000, // 45,000 to 55,000 SOL
      }
    })

    // Store mock data in database for future use
    await supabase.from("rewards_history").insert(mockData)

    return NextResponse.json({
      success: true,
      data: mockData,
      source: "mock",
    })
  } catch (error) {
    console.error("Error fetching reward analytics:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reward analytics",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
