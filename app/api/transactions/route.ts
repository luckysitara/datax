import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "20")

    const supabase = createServerSupabaseClient()

    // Try to get recent transactions from database
    const { data: recentTransactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("block_time", { ascending: false })
      .limit(limit)

    // If we have transactions in the database, return them
    if (!error && recentTransactions && recentTransactions.length > 0) {
      return NextResponse.json({
        success: true,
        data: recentTransactions,
        source: "database",
      })
    }

    // Otherwise, fetch from RPC
    console.log("Fetching transactions from RPC...")
    const transactionsResult = await solanaRpc.getRecentTransactions(limit)

    if (!transactionsResult.success) {
      // Generate mock data if RPC fails
      console.log("Generating mock transaction data...")
      const mockTransactions = Array.from({ length: limit }, (_, i) => {
        const signature = `mock${i}${Math.random().toString(36).substring(2, 10)}`
        const blockTime = new Date(Date.now() - i * 5000).toISOString()
        const slot = 100000000 - i
        const fee = Math.floor(Math.random() * 5000)
        const status = Math.random() > 0.1 ? "Success" : "Failed"
        const instructionType = ["System", "Token", "Stake", "Vote", "Other"][Math.floor(Math.random() * 5)]

        return {
          signature,
          block_time: blockTime,
          slot,
          fee,
          status,
          instruction_type: instructionType,
        }
      })

      return NextResponse.json({
        success: true,
        data: mockTransactions,
        source: "mock",
      })
    }

    const transactions = transactionsResult.data

    // Store transactions in database
    if (transactions.length > 0) {
      const transactionsToInsert = transactions.map((tx) => ({
        signature: tx.signature,
        block_time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
        slot: tx.slot,
        fee: tx.fee,
        status: tx.status,
        instruction_type: tx.instructionType,
        created_at: new Date().toISOString(),
      }))

      await supabase.from("transactions").upsert(transactionsToInsert, {
        onConflict: "signature",
      })
    }

    return NextResponse.json({
      success: true,
      data: transactions.map((tx) => ({
        signature: tx.signature,
        block_time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
        slot: tx.slot,
        fee: tx.fee,
        status: tx.status,
        instruction_type: tx.instructionType,
      })),
      source: "rpc",
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transactions",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
