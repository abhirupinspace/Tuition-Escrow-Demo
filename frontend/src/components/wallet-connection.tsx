// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Badge } from "@/components/ui/badge"
// import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertCircle, Zap } from "lucide-react"
// import { toast } from "sonner"
// import { web3Service, SEPOLIA_NETWORK, type WalletType } from "@/lib/web3"
// import { ethers } from "ethers"

// interface WalletConnectionProps {
//   onConnect: (address: string) => void
//   onDisconnect: () => void
//   isConnected: boolean
//   userAddress: string
// }

// export function WalletConnection({ onConnect, onDisconnect, isConnected, userAddress }: WalletConnectionProps) {
//   const [isConnecting, setIsConnecting] = useState(false)
//   const [usdcBalance, setUsdcBalance] = useState<string>("0")
//   const [ethBalance, setEthBalance] = useState<string>("0")
//   const [chainId, setChainId] = useState<number | null>(null)
//   const [contractPaused, setContractPaused] = useState<boolean>(false)

//   useEffect(() => {
//     // Check if already connected
//     checkConnection()

//     // Listen for account changes
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", handleAccountsChanged)
//       window.ethereum.on("chainChanged", handleChainChanged)
//     }

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
//         window.ethereum.removeListener("chainChanged", handleChainChanged)
//       }
//     }
//   }, [])

//   useEffect(() => {
//     if (isConnected && userAddress) {
//       fetchBalances()
//       checkContractStatus()
//     }
//   }, [isConnected, userAddress])

//   const checkConnection = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: "eth_accounts" })
//         if (accounts.length > 0) {
//           // Initialize the web3Service properly
//           const provider = new ethers.BrowserProvider(window.ethereum)
//           const signer = await provider.getSigner()
//           const network = await provider.getNetwork()

//           // Update web3Service state manually
//           web3Service.state = {
//             provider,
//             signer,
//             account: accounts[0],
//             chainId: Number(network.chainId),
//             isConnected: true,
//           }

//           onConnect(accounts[0])
//           setChainId(Number(network.chainId))
//         }
//       } catch (error) {
//         console.error("Error checking connection:", error)
//       }
//     }
//   }

//   const handleAccountsChanged = (accounts: string[]) => {
//     if (accounts.length === 0) {
//       handleDisconnect()
//     } else if (accounts[0] !== userAddress) {
//       onConnect(accounts[0])
//       toast.success("Account Changed", {
//         description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
//       })
//     }
//   }

//   const handleChainChanged = (chainId: string) => {
//     const newChainId = Number.parseInt(chainId, 16)
//     setChainId(newChainId)

//     if (newChainId !== SEPOLIA_NETWORK.chainId) {
//       toast.error("Wrong Network", {
//         description: "Please switch to Sepolia testnet",
//       })
//     } else {
//       toast.success("Network Connected", {
//         description: "Connected to Sepolia testnet",
//       })
//     }
//   }

//   const connectWallet = async (walletType: WalletType = "metamask") => {
//     setIsConnecting(true)
//     try {
//       if (walletType === "metamask" && !window.ethereum) {
//         toast.error("MetaMask Required", {
//           description: "Please install MetaMask to continue",
//         })
//         return
//       }

//       const address = await web3Service.connectWallet(walletType)
//       const state = web3Service.getState()

//       setChainId(state.chainId)
//       onConnect(address)

//       toast.success("Wallet Connected", {
//         description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
//       })

//       // Fetch balances and contract status
//       await fetchBalances()
//       await checkContractStatus()
//     } catch (error: any) {
//       console.error("Error connecting wallet:", error)
//       toast.error("Connection Failed", {
//         description: error.message || "Failed to connect wallet. Please try again.",
//       })
//     } finally {
//       setIsConnecting(false)
//     }
//   }

//   const fetchBalances = async () => {
//     try {
//       // Check if wallet is actually connected before fetching balances
//       const state = web3Service.getState()
//       if (!state.isConnected || !state.signer || !userAddress) {
//         console.log("Wallet not connected, skipping balance fetch")
//         return
//       }

//       const [usdcBal, ethBal] = await Promise.all([
//         web3Service.getUSDCBalance(userAddress),
//         web3Service.getETHBalance(userAddress),
//       ])
//       setUsdcBalance(usdcBal)
//       setEthBalance(ethBal)
//     } catch (error) {
//       console.error("Error fetching balances:", error)
//       // Reset balances on error
//       setUsdcBalance("0")
//       setEthBalance("0")
//     }
//   }

//   const checkContractStatus = async () => {
//     try {
//       const paused = await web3Service.isPaused()
//       setContractPaused(paused)
//       if (paused) {
//         toast.warning("Contract Paused", {
//           description: "The payment system is currently paused",
//         })
//       }
//     } catch (error) {
//       console.error("Error checking contract status:", error)
//     }
//   }

//   const handleDisconnect = () => {
//     web3Service.disconnect()
//     setUsdcBalance("0")
//     setEthBalance("0")
//     setChainId(null)
//     setContractPaused(false)
//     onDisconnect()
//     toast.success("Wallet Disconnected", {
//       description: "Successfully disconnected from wallet",
//     })
//   }

//   const copyAddress = () => {
//     navigator.clipboard.writeText(userAddress)
//     toast.success("Address Copied", {
//       description: "Wallet address copied to clipboard",
//     })
//   }

//   const viewOnExplorer = () => {
//     window.open(`${SEPOLIA_NETWORK.blockExplorer}/address/${userAddress}`, "_blank")
//   }

//   const switchToSepolia = async () => {
//     try {
//       await web3Service.switchToSepolia()
//       toast.success("Network Switched", {
//         description: "Successfully switched to Sepolia testnet",
//       })
//     } catch (error: any) {
//       toast.error("Network Switch Failed", {
//         description: error.message || "Failed to switch network",
//       })
//     }
//   }

//   const isWrongNetwork = chainId && chainId !== SEPOLIA_NETWORK.chainId

//   if (!isConnected) {
//     return (
//       <div className="flex items-center gap-2">
//         <Button
//           onClick={() => connectWallet("metamask")}
//           disabled={isConnecting}
//           className="bg-white text-black hover:bg-neutral-100 px-6 py-2.5 rounded-lg font-medium transition-all duration-300"
//           data-slot="button"
//         >
//           <Wallet className="w-4 h-4 mr-2" />
//           {isConnecting ? "Connecting..." : "Connect Wallet"}
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="flex items-center gap-3">
//       {/* Contract Status */}
//       {contractPaused && (
//         <Badge
//           className="bg-yellow-950/50 border border-yellow-800/50 text-yellow-400 px-3 py-1 font-light"
//           data-slot="badge"
//         >
//           <AlertCircle className="w-3 h-3 mr-1" />
//           Paused
//         </Badge>
//       )}

//       {/* Network Status */}
//       {isWrongNetwork ? (
//         <Button
//           onClick={switchToSepolia}
//           size="sm"
//           className="bg-red-950/50 border border-red-800/50 text-red-400 hover:bg-red-950/70 px-3 py-1.5"
//           data-slot="button"
//         >
//           <AlertCircle className="w-3 h-3 mr-1" />
//           Wrong Network
//         </Button>
//       ) : (
//         <Badge
//           className="bg-green-950/50 border border-green-800/50 text-green-400 px-3 py-1 font-light"
//           data-slot="badge"
//         >
//           <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
//           Sepolia
//         </Badge>
//       )}

//       {/* USDC Balance */}
//       <Badge
//         className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1 font-light"
//         data-slot="badge"
//       >
//         <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
//         {Number.parseFloat(usdcBalance).toFixed(2)} USDC
//       </Badge>

//       {/* Wallet Dropdown */}
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             className="bg-neutral-950/50 border border-neutral-800/50 text-white hover:bg-neutral-950/70 backdrop-blur-sm rounded-lg px-4 py-2.5 transition-all duration-300"
//             data-slot="trigger"
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-6 h-6 bg-neutral-800 rounded-md flex items-center justify-center">
//                 <Wallet className="w-3 h-3 text-neutral-400" />
//               </div>
//               <span className="font-mono text-sm">
//                 {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
//               </span>
//               <ChevronDown className="w-4 h-4" />
//             </div>
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent
//           align="end"
//           className="w-64 bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl text-white"
//           data-slot="content"
//         >
//           <div className="p-3 border-b border-neutral-800/50">
//             <div className="text-sm text-neutral-400 mb-1">Wallet Address</div>
//             <div className="font-mono text-xs text-white break-all">{userAddress}</div>
//           </div>

//           <div className="p-3 border-b border-neutral-800/50">
//             <div className="text-sm text-neutral-400 mb-1">Balances</div>
//             <div className="space-y-1">
//               <div className="text-white font-medium">{Number.parseFloat(usdcBalance).toFixed(2)} USDC</div>
//               <div className="text-neutral-300 text-sm">{Number.parseFloat(ethBalance).toFixed(4)} ETH</div>
//             </div>
//           </div>

//           <DropdownMenuItem onClick={copyAddress} className="hover:bg-neutral-900/50" data-slot="item">
//             <Copy className="w-4 h-4 mr-3 text-neutral-400" />
//             Copy Address
//           </DropdownMenuItem>

//           <DropdownMenuItem onClick={viewOnExplorer} className="hover:bg-neutral-900/50" data-slot="item">
//             <ExternalLink className="w-4 h-4 mr-3 text-neutral-400" />
//             View on Explorer
//           </DropdownMenuItem>

//           {isWrongNetwork && (
//             <DropdownMenuItem onClick={switchToSepolia} className="hover:bg-neutral-900/50" data-slot="item">
//               <Zap className="w-4 h-4 mr-3 text-neutral-400" />
//               Switch to Sepolia
//             </DropdownMenuItem>
//           )}

//           <DropdownMenuItem onClick={handleDisconnect} className="hover:bg-red-950/20 text-red-400" data-slot="item">
//             <LogOut className="w-4 h-4 mr-3" />
//             Disconnect
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertCircle, Zap } from "lucide-react"
import { toast } from "sonner"
import { ethers } from "ethers"

// Web3 configuration
const SEPOLIA_NETWORK = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/",
  blockExplorer: "https://sepolia.etherscan.io"
}

// Your contract addresses
const CONTRACTS = {
  TUITION_ESCROW: "0xd81AE6A442B19E8D1c742FB75bD248eBcC4f3D06", 
  MUSDC: "0x466e34e422e7775e7EbB606c9F4cE870e9A2817e"
}

interface WalletConnectionProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
  isConnected: boolean
  userAddress: string
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

export function WalletConnection({ onConnect, onDisconnect, isConnected, userAddress }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<string>("0")
  const [ethBalance, setEthBalance] = useState<string>("0")
  const [chainId, setChainId] = useState<number | null>(null)
  const [contractPaused, setContractPaused] = useState<boolean>(false)

  useEffect(() => {
    checkConnection()
    
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchBalances()
      checkContractStatus()
    }
  }, [isConnected, userAddress])

  const checkConnection = async () => {
    if (typeof window === "undefined" || !window.ethereum) return

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        
        onConnect(accounts[0])
        setChainId(Number(network.chainId))
      }
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect()
    } else if (accounts[0] !== userAddress) {
      onConnect(accounts[0])
      toast.success("Account Changed", {
        description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      })
    }
  }

  const handleChainChanged = (chainId: string) => {
    const newChainId = Number.parseInt(chainId, 16)
    setChainId(newChainId)
    
    if (newChainId !== SEPOLIA_NETWORK.chainId) {
      toast.error("Wrong Network", {
        description: "Please switch to Sepolia testnet",
      })
    } else {
      toast.success("Network Connected", {
        description: "Connected to Sepolia testnet",
      })
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("MetaMask Required", {
        description: "Please install MetaMask to continue",
      })
      return
    }

    setIsConnecting(true)
    
    try {
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      })
      
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        
        setChainId(Number(network.chainId))
        onConnect(accounts[0])
        
        toast.success("Wallet Connected", {
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast.error("Connection Failed", {
        description: error.message || "Failed to connect wallet. Please try again.",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchBalances = async () => {
    if (!userAddress || typeof window === "undefined" || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // Get ETH balance
      const ethBal = await provider.getBalance(userAddress)
      setEthBalance(ethers.formatEther(ethBal))

      // Get USDC balance
      const usdcContract = new ethers.Contract(
        CONTRACTS.MUSDC,
        [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ],
        provider
      )
      
      const usdcBal = await usdcContract.balanceOf(userAddress)
      const decimals = await usdcContract.decimals()
      setUsdcBalance(ethers.formatUnits(usdcBal, decimals))
      
    } catch (error) {
      console.error("Error fetching balances:", error)
      setUsdcBalance("0")
      setEthBalance("0")
    }
  }

  const checkContractStatus = async () => {
    if (!CONTRACTS.TUITION_ESCROW || CONTRACTS.TUITION_ESCROW === "0x...") {
      return // Skip if contract not deployed yet
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const contract = new ethers.Contract(
        CONTRACTS.TUITION_ESCROW,
        ["function paused() view returns (bool)"],
        provider
      )
      
      const paused = await contract.paused()
      setContractPaused(paused)
      
      if (paused) {
        toast.warning("Contract Paused", {
          description: "The payment system is currently paused",
        })
      }
    } catch (error) {
      console.error("Error checking contract status:", error)
    }
  }

  const handleDisconnect = () => {
    setUsdcBalance("0")
    setEthBalance("0")
    setChainId(null)
    setContractPaused(false)
    onDisconnect()
    
    toast.success("Wallet Disconnected", {
      description: "Successfully disconnected from wallet",
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress)
    toast.success("Address Copied", {
      description: "Wallet address copied to clipboard",
    })
  }

  const viewOnExplorer = () => {
    window.open(`${SEPOLIA_NETWORK.blockExplorer}/address/${userAddress}`, "_blank")
  }

  const switchToSepolia = async () => {
    if (typeof window === "undefined" || !window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_NETWORK.chainId.toString(16)}` }],
      })
      
      toast.success("Network Switched", {
        description: "Successfully switched to Sepolia testnet",
      })
    } catch (error: any) {
      // If the network is not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: `0x${SEPOLIA_NETWORK.chainId.toString(16)}`,
              chainName: SEPOLIA_NETWORK.name,
              rpcUrls: [SEPOLIA_NETWORK.rpcUrl],
              blockExplorerUrls: [SEPOLIA_NETWORK.blockExplorer],
            }],
          })
        } catch (addError) {
          toast.error("Network Switch Failed", {
            description: "Failed to add Sepolia network",
          })
        }
      } else {
        toast.error("Network Switch Failed", {
          description: error.message || "Failed to switch network",
        })
      }
    }
  }

  const isWrongNetwork = chainId && chainId !== SEPOLIA_NETWORK.chainId

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-white text-black hover:bg-neutral-100 px-6 py-2.5 rounded-lg font-medium transition-all duration-300"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* Contract Status */}
      {contractPaused && (
        <Badge className="bg-yellow-950/50 border border-yellow-800/50 text-yellow-400 px-3 py-1 font-light">
          <AlertCircle className="w-3 h-3 mr-1" />
          Paused
        </Badge>
      )}

      {/* Network Status */}
      {isWrongNetwork ? (
        <Button
          onClick={switchToSepolia}
          size="sm"
          className="bg-red-950/50 border border-red-800/50 text-red-400 hover:bg-red-950/70 px-3 py-1.5"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          Wrong Network
        </Button>
      ) : (
        <Badge className="bg-green-950/50 border border-green-800/50 text-green-400 px-3 py-1 font-light">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
          Sepolia
        </Badge>
      )}

      {/* USDC Balance */}
      <Badge className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1 font-light">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
        {Number.parseFloat(usdcBalance).toFixed(2)} USDC
      </Badge>

      {/* Wallet Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-neutral-950/50 border border-neutral-800/50 text-white hover:bg-neutral-950/70 backdrop-blur-sm rounded-lg px-4 py-2.5 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-neutral-800 rounded-md flex items-center justify-center">
                <Wallet className="w-3 h-3 text-neutral-400" />
              </div>
              <span className="font-mono text-sm">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent
          align="end"
          className="w-64 bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl text-white"
        >
          <div className="p-3 border-b border-neutral-800/50">
            <div className="text-sm text-neutral-400 mb-1">Wallet Address</div>
            <div className="font-mono text-xs text-white break-all">{userAddress}</div>
          </div>
          
          <div className="p-3 border-b border-neutral-800/50">
            <div className="text-sm text-neutral-400 mb-1">Balances</div>
            <div className="space-y-1">
              <div className="text-white font-medium">{Number.parseFloat(usdcBalance).toFixed(2)} USDC</div>
              <div className="text-neutral-300 text-sm">{Number.parseFloat(ethBalance).toFixed(4)} ETH</div>
            </div>
          </div>
          
          <DropdownMenuItem onClick={copyAddress} className="hover:bg-neutral-900/50">
            <Copy className="w-4 h-4 mr-3 text-neutral-400" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={viewOnExplorer} className="hover:bg-neutral-900/50">
            <ExternalLink className="w-4 h-4 mr-3 text-neutral-400" />
            View on Explorer
          </DropdownMenuItem>
          
          {isWrongNetwork && (
            <DropdownMenuItem onClick={switchToSepolia} className="hover:bg-neutral-900/50">
              <Zap className="w-4 h-4 mr-3 text-neutral-400" />
              Switch to Sepolia
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleDisconnect} className="hover:bg-red-950/20 text-red-400">
            <LogOut className="w-4 h-4 mr-3" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}