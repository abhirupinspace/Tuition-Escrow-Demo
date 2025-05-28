"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertCircle, Zap } from "lucide-react"
import { toast } from "sonner"
import { formatEther } from "viem"
import { sepolia } from "viem/chains"

interface WalletConnectionProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
  isConnected: boolean
  userAddress: string
}

export function WalletConnection({ onConnect, onDisconnect, isConnected, userAddress }: WalletConnectionProps) {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [usdcBalance, setUsdcBalance] = useState<string>("0")

  // Get ETH balance
  const { data: ethBalance, isLoading: isLoadingEthBalance } = useBalance({
    address: account.address,
    chainId: 11155111, // Sepolia chain ID
    watch: true // Optional: to keep balance updated in real-time
  })

  // Get USDC balance
  const { data: usdcBalanceData, isLoading: isLoadingUsdcBalance } = useBalance({
    address: account.address,
    token: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`,
    chainId: sepolia.id,
    watch: true // Optional: to keep balance updated in real-time
  })

  useEffect(() => {
    if (account.status === "connected" && account.address) {
      onConnect(account.address)

      // Check if we're on the correct network
      if (chainId !== sepolia.id) {
        toast.error("Wrong Network", {
          description: "Please switch to Sepolia testnet",
        })
      }
    } else if (account.status === "disconnected") {
      onDisconnect()
    }
  }, [account.status, account.address, chainId, onConnect, onDisconnect])

  useEffect(() => {
    if (usdcBalanceData) {
      setUsdcBalance(formatEther(usdcBalanceData.value))
    }
  }, [usdcBalanceData])

  // Filter connectors
  const metamaskConnector = connectors.find((connector) => connector.name === "MetaMask")
  const walletConnectConnector = connectors.find((connector) => connector.name === "WalletConnect")
  const coinbaseConnector = connectors.find((connector) => connector.name === "Coinbase Wallet")

  const handleConnect = (connector: any) => {
    connect({ connector })
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success("Wallet Disconnected", {
      description: "Successfully disconnected from wallet",
    })
  }

  const copyAddress = () => {
    if (account.address) {
      navigator.clipboard.writeText(account.address)
      toast.success("Address Copied", {
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const viewOnExplorer = () => {
    if (account.address) {
      window.open(`https://sepolia.etherscan.io/address/${account.address}`, "_blank")
    }
  }

  const switchToSepolia = async () => {
    try {
      switchChain({ chainId: sepolia.id })
      toast.success("Network Switching", {
        description: "Switching to Sepolia testnet...",
      })
    } catch (error: any) {
      toast.error("Network Switch Failed", {
        description: error.message || "Failed to switch network",
      })
    }
  }

  const isWrongNetwork = chainId && chainId !== sepolia.id

  if (account.status !== "connected") {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={status === "pending"}
              className="bg-white text-black hover:bg-neutral-100 px-6 py-2.5 rounded-lg font-medium transition-all duration-300"
              data-slot="button"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {status === "pending" ? "Connecting..." : "Connect Wallet"}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl text-white"
            data-slot="content"
          >
            {metamaskConnector && (
              <DropdownMenuItem
                onClick={() => handleConnect(metamaskConnector)}
                className="hover:bg-neutral-900/50 cursor-pointer"
                data-slot="item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span>MetaMask</span>
                </div>
              </DropdownMenuItem>
            )}

            {walletConnectConnector && (
              <DropdownMenuItem
                onClick={() => handleConnect(walletConnectConnector)}
                className="hover:bg-neutral-900/50 cursor-pointer"
                data-slot="item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">WC</span>
                  </div>
                  <span>WalletConnect</span>
                </div>
              </DropdownMenuItem>
            )}

            {coinbaseConnector && (
              <DropdownMenuItem
                onClick={() => handleConnect(coinbaseConnector)}
                className="hover:bg-neutral-900/50 cursor-pointer"
                data-slot="item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">CB</span>
                  </div>
                  <span>Coinbase Wallet</span>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {error && <div className="text-sm text-red-400 max-w-xs">{error.message}</div>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* Network Status */}
      {isWrongNetwork ? (
        <Button
          onClick={switchToSepolia}
          size="sm"
          className="bg-red-950/50 border border-red-800/50 text-red-400 hover:bg-red-950/70 px-3 py-1.5"
          data-slot="button"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          Switch to Sepolia
        </Button>
      ) : (
        <Badge
          className="bg-green-950/50 border border-green-800/50 text-green-400 px-3 py-1 font-light"
          data-slot="badge"
        >
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
          Sepolia
        </Badge>
      )}

      {/* USDC Balance */}
      <Badge
        className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1 font-light"
        data-slot="badge"
      >
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
        {isLoadingUsdcBalance ? (
          <span className="flex items-center">
            <div className="w-3 h-3 border-2 border-neutral-400 border-t-white rounded-full animate-spin mr-1"></div>
            Loading...
          </span>
        ) : (
          `${Number.parseFloat(usdcBalance).toFixed(2)} mUSDC`
        )}
      </Badge>

      {/* Wallet Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-neutral-950/50 border border-neutral-800/50 text-white hover:bg-neutral-950/70 backdrop-blur-sm rounded-lg px-4 py-2.5 transition-all duration-300"
            data-slot="trigger"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-neutral-800 rounded-md flex items-center justify-center">
                <Wallet className="w-3 h-3 text-neutral-400" />
              </div>
              <span className="font-mono text-sm">
                {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
              </span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl text-white"
          data-slot="content"
        >
          <div className="p-3 border-b border-neutral-800/50">
            <div className="text-sm text-neutral-400 mb-1">Wallet Address</div>
            <div className="font-mono text-xs text-white break-all">{account.address}</div>
          </div>

          <div className="p-3 border-b border-neutral-800/50">
            <div className="text-sm text-neutral-400 mb-1">Balances</div>
            <div className="space-y-1">
              <div className="text-white font-medium">
                {isLoadingUsdcBalance ? (
                  <span className="flex items-center">
                    <div className="w-3 h-3 border-2 border-neutral-400 border-t-white rounded-full animate-spin mr-1"></div>
                    Loading mUSDC...
                  </span>
                ) : (
                  `${Number.parseFloat(usdcBalance).toFixed(2)} mUSDC`
                )}
              </div>
              <div className="text-neutral-300 text-sm">
                {isLoadingEthBalance ? (
                  <span className="flex items-center">
                    <div className="w-3 h-3 border-2 border-neutral-400 border-t-white rounded-full animate-spin mr-1"></div>
                    Loading ETH...
                  </span>
                ) : ethBalance ? (
                  `${Number.parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH`
                ) : (
                  "0.0000 ETH"
                )}
              </div>
            </div>
          </div>

          <div className="p-3 border-b border-neutral-800/50">
            <div className="text-sm text-neutral-400 mb-1">Connected via</div>
            <div className="text-white text-sm">{account.connector?.name}</div>
          </div>

          <DropdownMenuItem onClick={copyAddress} className="hover:bg-neutral-900/50" data-slot="item">
            <Copy className="w-4 h-4 mr-3 text-neutral-400" />
            Copy Address
          </DropdownMenuItem>

          <DropdownMenuItem onClick={viewOnExplorer} className="hover:bg-neutral-900/50" data-slot="item">
            <ExternalLink className="w-4 h-4 mr-3 text-neutral-400" />
            View on Explorer
          </DropdownMenuItem>

          {isWrongNetwork && (
            <DropdownMenuItem onClick={switchToSepolia} className="hover:bg-neutral-900/50" data-slot="item">
              <Zap className="w-4 h-4 mr-3 text-neutral-400" />
              Switch to Sepolia
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleDisconnect} className="hover:bg-red-950/20 text-red-400" data-slot="item">
            <LogOut className="w-4 h-4 mr-3" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
