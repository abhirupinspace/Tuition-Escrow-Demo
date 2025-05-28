"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccount, useChainId, useBalance } from "wagmi"
import { formatEther } from "viem"
import { CONTRACT_ADDRESSES } from "@/lib/config"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { address, connector, status } = useAccount()
  const chainId = useChainId()

  const { data: ethBalance } = useBalance({
    address,
    chainId,
    // For Sepolia ETH, we don't need to specify a token address
    // as undefined or omitting the token prop will default to native ETH
  })

  const { data: usdcBalance } = useBalance({
    address,
    token: "0x466e34e422e7775e7EbB606c9F4cE870e9A2817e"
    
  })

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 bg-neutral-900 text-white hover:bg-neutral-800"
        onClick={() => setIsOpen(true)}
      >
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 bg-neutral-900 border-neutral-800 text-white z-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Debug Panel</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <span className="text-neutral-400">Wallet Status:</span> {status}
        </div>
        <div>
          <span className="text-neutral-400">Connector:</span> {connector?.name || "None"}
        </div>
        <div>
          <span className="text-neutral-400">Chain ID:</span> {chainId || "Not connected"}
        </div>
        <div>
          <span className="text-neutral-400">Address:</span> {address || "Not connected"}
        </div>
        <div>
          <span className="text-neutral-400">ETH Balance:</span>{" "}
          {ethBalance ? formatEther(ethBalance.value) : "Unknown"}
        </div>
        <div>
          <span className="text-neutral-400">USDC Balance:</span>{" "}
          {usdcBalance ? formatEther(usdcBalance.value) : "Unknown"}
        </div>
        <div className="pt-2">
          <span className="text-neutral-400">Contract Addresses:</span>
          <div className="pl-2 pt-1">
            <div>
              <span className="text-neutral-400">TUITION_ESCROW:</span> {CONTRACT_ADDRESSES.TUITION_ESCROW}
            </div>
            <div>
              <span className="text-neutral-400">USDC:</span> {CONTRACT_ADDRESSES.USDC}
            </div>
            <div>
              <span className="text-neutral-400">ADMIN:</span> {CONTRACT_ADDRESSES.ADMIN}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
