import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get("metric") || "network_stats"
    const from = searchParams.get("from") || (Date.now() - 24 * 60 * 60 * 1000).toString()
    const to = searchParams.get("to") || Date.now().toString()

    const supabase = createServerSupabaseClient()

    let data = []

    switch (metric) {
      case "network_stats":
        // Fetch network stats time series
        const { data: networkStats, error: networkError } = await supabase
          .from("network_stats")
          .select("*")
          .gte("time", new Date(Number(from)).toISOString())
          .lte("time", new Date(Number(to)).toISOString())
          .order("time", { ascending: true })

        if (networkError) {
          throw networkError
        }

        data = networkStats || []
        break

      case "validator_performance":
        // Fetch validator performance time series
        const { data: validatorPerformance, error: performanceError } = await supabase
          .from("validator_history")
          .select("time, validator_pubkey, performance_score")
          .gte("time", new Date(Number(from)).toISOString())
          .lte("time", new Date(Number(to)).toISOString())
          .order("time", { ascending: true })

        if (performanceError) {
          throw performanceError
        }

        data = validatorPerformance || []
        break

      case "rewards_history":
        // Fetch rewards history time series
        const { data: rewardsHistory, error: rewardsError } = await supabase
          .from("rewards_history")
          .select("time, validator_pubkey, apy")
          .gte("time", new Date(Number(from)).toISOString())
          .lte("time", new Date(Number(to)).toISOString())
          .order("time", { ascending: true })

        if (rewardsError) {
          throw rewardsError
        }

        data = rewardsHistory || []
        break

      case "risk_assessments":
        // Fetch risk assessments time series
        const { data: riskAssessments, error: riskError } = await supabase
          .from("risk_assessments")
          .select("time, validator_pubkey, risk_score")
          .gte("time", new Date(Number(from)).toISOString())
          .lte("time", new Date(Number(to)).toISOString())
          .order("time", { ascending: true })

        if (riskError) {
          throw riskError
        }

        data = riskAssessments || []
        break

      case "blocks":
        // Fetch blocks time series
        const { data: blocks, error: blocksError } = await supabase
          .from("blocks")
          .select("time, slot, transactions")
          .gte("time", new Date(Number(from)).toISOString())
          .lte("time", new Date(Number(to)).toISOString())
          .order("time", { ascending: true })

        if (blocksError) {
          throw blocksError
        }

        data = blocks || []
        break

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid metric specified",
          },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: true,
      data,
      metric,
      timeRange: {
        from: new Date(Number(from)).toISOString(),
        to: new Date(Number(to)).toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching Grafana data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Grafana data",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
