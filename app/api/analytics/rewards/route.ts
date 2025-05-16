import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all epochs with rewards data
    const { data: epochs, error: epochError } = await supabase
      .from("rewards_history")
      .select("epoch")
      .order("epoch", { ascending: true })
      .limit(12)

    if (epochError) {
      throw epochError
    }

    if (!epochs || epochs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get unique epochs
    const uniqueEpochs = [...new Set(epochs.map((e) => e.epoch))]

    // For each epoch, calculate min, max, and average rewards
    const rewardTrends = await Promise.all(
      uniqueEpochs.map(async (epoch) => {
        const { data: rewards, error: rewardsError } = await supabase
          .from("rewards_history")
          .select("apy")
          .eq("epoch", epoch)
          .not("apy", "is", null)

        if (rewardsError) {
          throw rewardsError
        }

        if (!rewards || rewards.length === 0) {
          return {
            epoch,
            avgReward: 0,
            topReward: 0,
            minReward: 0,
          }
        }

        const apyValues = rewards.map((r) => r.apy || 0).filter((apy) => apy > 0)

        if (apyValues.length === 0) {
          return {
            epoch,
            avgReward: 0,
            topReward: 0,
            minReward: 0,
          }
        }

        const avgReward = apyValues.reduce((sum, apy) => sum + apy, 0) / apyValues.length
        const topReward = Math.max(...apyValues)
        const minReward = Math.min(...apyValues)

        return {
          epoch,
          avgReward,
          topReward,
          minReward,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: rewardTrends,
    })
  } catch (error) {
    console.error("Error fetching reward trends:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reward trends",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
