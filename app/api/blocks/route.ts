import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "10")

    // Get recent blocks using our improved method
    const blocksResult = await solanaRpc.getRecentBlocks(limit)

    if (!blocksResult.success) {
      throw new Error(blocksResult.error || "Failed to fetch recent blocks")
    }

    return NextResponse.json({
      success: true,
      data: blocksResult.data,
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
