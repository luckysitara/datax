import { NextResponse } from "next/server"
import * as solanaRpc from "@/lib/solana-rpc"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "10")

    // Try to get recent confirmed signatures for the System program
    const signaturesResult = await solanaRpc.getSignaturesForAddress(
      "11111111111111111111111111111111", // System program
      limit * 2, // Fetch more than we need in case some fail
    )

    if (!signaturesResult.success) {
      throw new Error(`Failed to fetch signatures: ${signaturesResult.error}`)
    }

    const signatures = signaturesResult.data

    // Process signatures to extract basic transaction info
    const transactions = signatures.slice(0, limit).map((sig: any) => {
      return {
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime || Math.floor(Date.now() / 1000) - 60,
        fee: null, // Not available without getTransaction
        status: sig.err ? "Failed" : "Success",
        instructions: null, // Not available without getTransaction
        instructionType: "Unknown", // Not available without getTransaction
      }
    })

    return NextResponse.json({
      success: true,
      data: transactions,
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
