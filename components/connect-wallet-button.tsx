"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ConnectWalletButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true)

      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Wallet Connection",
        description: "This is a demo. Wallet connection is not implemented in this version.",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "There was an error connecting your wallet. Please try again.",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Button onClick={handleConnectWallet} disabled={isConnecting}>
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
