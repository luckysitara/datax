import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const validatorId = params.id

    if (!validatorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Validator ID is required",
        },
        { status: 400 },
      )
    }

    // Try to get validator risk assessments from database
    const supabase = createServerSupabaseClient()
    let riskData = []
    let dbError = null

    try {
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("validator_pubkey", validatorId)
        .order("epoch", { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      riskData = data || []
    } catch (error) {
      console.error(`Error fetching risk data for validator ${validatorId}:`, error)
      dbError = error
    }

    // If we have risk data from the database, return it
    if (riskData.length > 0) {
      return NextResponse.json({
        success: true,
        data: riskData,
        source: "database",
      })
    }

    // If database failed or returned no risk data, generate realistic data
    console.log(`Generating realistic risk data for validator ${validatorId}`)

    // Get validator to determine delinquency
    let delinquent = false
    try {
      const { data: validator } = await supabase
        .from("validators")
        .select("delinquent")
        .eq("pubkey", validatorId)
        .single()

      if (validator) {
        delinquent = validator.delinquent
      }
    } catch (error) {
      console.error(`Error fetching validator ${validatorId} for delinquency:`, error)
    }

    const currentEpoch = Math.floor(Date.now() / (2 * 24 * 60 * 60 * 1000))
    const baseRiskScore = delinquent ? 70 : 25

    const generatedRiskData = Array.from({ length: 10 }, (_, i) => {
      const epoch = currentEpoch - i
      const risk_score = baseRiskScore + (Math.random() * 10 - 5)
      const delinquency_risk = delinquent ? 80 : 10
      const concentration_risk = Math.floor(Math.random() * 30) + 10
      const uptime_risk = delinquent ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15) + 5
      const skip_rate_risk = delinquent ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15) + 5
      const commission_change_risk = Math.floor(Math.random() * 10) + 5

      return {
        validator_pubkey: validatorId,
        epoch,
        risk_score,
        delinquency_risk,
        concentration_risk,
        uptime_risk,
        skip_rate_risk,
        commission_change_risk,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: generatedRiskData,
      source: "generated",
      dbError: dbError ? (dbError as Error).message : null,
    })
  } catch (error) {
    console.error("Error fetching validator risk data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch validator risk data",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
