import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "10")

    const supabase = createServerSupabaseClient()

    // Try to get recent blocks from database
    const { data: recentBlocks, error } = await supabase
      .from("blocks")
      .select("*")
      .order("slot", { ascending: false })
      .limit(limit)

    // If we have blocks in the database, return them
    if (!error && recentBlocks && recentBlocks.length > 0) {
      return NextResponse.json({
        success: true,
        data: recentBlocks,
        source: "database",
      })
    }

    // Otherwise, fetch from RPC
    console.log("Fetching blocks from RPC...")
    const blocksResult = await solanaRpc.getRecentBlocks(limit)

    if (!blocksResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch blocks from RPC",
          error: blocksResult.error,
        },
        { status: 500 },
      )
    }

    const blocks = blocksResult.data

    // Store blocks in database
    if (blocks.length > 0) {
      const blocksToInsert = blocks.map((block) => ({
        slot: block.slot,
        block_time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
        block_height: block.blockHeight,
        leader: block.leader,
        transactions: block.transactions,
        fees: block.fees,
        created_at: new Date().toISOString(),
      }))

      await supabase.from("blocks").upsert(blocksToInsert, {
        onConflict: "slot",
      })
    }

    return NextResponse.json({
      success: true,
      data: blocks.map((block) => ({
        slot: block.slot,
        block_time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
        block_height: block.blockHeight,
        leader: block.leader,
        transactions: block.transactions,
        fees: block.fees,
      })),
      source: "rpc",
    })
  } catch (error) {
    console.error("Error fetching blocks:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blocks",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
