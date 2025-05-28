import { ethers } from "ethers"

// Updated TuitionEscrow contract ABI from the provided snippet
export const TUITION_ESCROW_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_stablecoin",
        type: "address",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "PaymentAlreadyProcessed",
    type: "error",
  },
  {
    inputs: [],
    name: "PaymentNotDeposited",
    type: "error",
  },
  {
    inputs: [],
    name: "PaymentNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedAccess",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "university",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "invoiceRef",
        type: "string",
      },
    ],
    name: "PaymentInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Refunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "university",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Released",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPaymentId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
    ],
    name: "getPayerPayments",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "getPayment",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "payer",
            type: "address",
          },
          {
            internalType: "address",
            name: "university",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "invoiceRef",
            type: "string",
          },
          {
            internalType: "enum TuitionEscrow.PaymentStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "depositedAt",
            type: "uint256",
          },
        ],
        internalType: "struct TuitionEscrow.Payment",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "university",
        type: "address",
      },
    ],
    name: "getUniversityPayments",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        internalType: "address",
        name: "university",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "invoiceRef",
        type: "string",
      },
    ],
    name: "initialize",
    outputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "payerPayments",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "payments",
    outputs: [
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        internalType: "address",
        name: "university",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "invoiceRef",
        type: "string",
      },
      {
        internalType: "enum TuitionEscrow.PaymentStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "depositedAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stablecoin",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "universityPayments",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

// USDC Token ABI (minimal for our needs)
export const USDC_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

// Contract addresses (Sepolia testnet)
export const CONTRACT_ADDRESSES = {
  TUITION_ESCROW: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1",
  USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
  ADMIN: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1",
}

// Network configuration
export const SEPOLIA_NETWORK = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/",
  blockExplorer: "https://sepolia.etherscan.io",
}

// Payment status enum (updated to match contract)
export enum PaymentStatus {
  INITIALIZED = 0,
  DEPOSITED = 1,
  RELEASED = 2,
  REFUNDED = 3,
  PENDING,
}

// Types (updated to match new contract structure)
export interface Payment {
  invoiceReference: any
  id: any
  payer: string
  university: string
  amount: bigint
  invoiceRef: string
  status: PaymentStatus
  createdAt: bigint
  depositedAt: bigint
}

export interface Web3State {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  chainId: number | null
  isConnected: boolean
}

// Wallet connection types
export type WalletType = "metamask" | "walletconnect" | "coinbase"

// Web3 utilities
export class Web3Service {
  private static instance: Web3Service
  public state: Web3State = {
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    isConnected: false,
  }

  static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service()
    }
    return Web3Service.instance
  }

  async connectWallet(walletType: WalletType = "metamask"): Promise<string> {
    try {
      let provider: ethers.BrowserProvider

      switch (walletType) {
        case "metamask":
          if (!window.ethereum) {
            throw new Error("MetaMask is not installed")
          }
          provider = new ethers.BrowserProvider(window.ethereum)
          break

        case "walletconnect":
          // WalletConnect integration would go here
          // For now, fallback to MetaMask
          if (!window.ethereum) {
            throw new Error("No wallet found")
          }
          provider = new ethers.BrowserProvider(window.ethereum)
          break

        case "coinbase":
          // Coinbase Wallet integration would go here
          // For now, fallback to MetaMask
          if (!window.ethereum) {
            throw new Error("No wallet found")
          }
          provider = new ethers.BrowserProvider(window.ethereum)
          break

        default:
          throw new Error("Unsupported wallet type")
      }

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      // Create signer
      this.state.provider = provider
      this.state.signer = await provider.getSigner()
      this.state.account = accounts[0]

      // Get network info
      const network = await provider.getNetwork()
      this.state.chainId = Number(network.chainId)
      this.state.isConnected = true

      // Check if we're on the correct network
      if (this.state.chainId !== SEPOLIA_NETWORK.chainId) {
        await this.switchToSepolia()
      }

      if (!this.state.account) {
        throw new Error("Failed to connect wallet: no account found")
      }

      return this.state.account
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_NETWORK.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SEPOLIA_NETWORK.chainId.toString(16)}`,
                chainName: SEPOLIA_NETWORK.name,
                rpcUrls: [SEPOLIA_NETWORK.rpcUrl],
                blockExplorerUrls: [SEPOLIA_NETWORK.blockExplorer],
              },
            ],
          })
        } catch (addError) {
          throw new Error("Failed to add Sepolia network")
        }
      } else {
        throw new Error("Failed to switch to Sepolia network")
      }
    }
  }

  disconnect(): void {
    this.state = {
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
    }
  }

  getState(): Web3State {
    return { ...this.state }
  }

  // Contract interactions
  getTuitionEscrowContract(): ethers.Contract {
    if (!this.state.signer) {
      throw new Error("Wallet not connected")
    }
    return new ethers.Contract(CONTRACT_ADDRESSES.TUITION_ESCROW, TUITION_ESCROW_ABI, this.state.signer)
  }

  getUSDCContract(): ethers.Contract {
    if (!this.state.signer) {
      throw new Error("Wallet not connected")
    }
    return new ethers.Contract(CONTRACT_ADDRESSES.USDC, USDC_ABI, this.state.signer)
  }

  // Updated payment operations for new contract structure
  async createPayment(universityAddress: string, amount: string, invoiceRef: string): Promise<string> {
    try {
      const escrowContract = this.getTuitionEscrowContract()
      const usdcContract = this.getUSDCContract()

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = ethers.parseUnits(amount, 6)

      // Check USDC balance
      const balance = await usdcContract.balanceOf(this.state.account)
      if (balance < amountWei) {
        throw new Error("Insufficient USDC balance")
      }

      // Step 1: Initialize payment
      const initTx = await escrowContract.initialize(this.state.account, universityAddress, amountWei, invoiceRef)
      const initReceipt = await initTx.wait()

      // Get payment ID from the event
      const paymentInitializedEvent = initReceipt.logs.find((log: any) => {
        try {
          const parsed = escrowContract.interface.parseLog(log)
          return parsed?.name === "PaymentInitialized"
        } catch {
          return false
        }
      })

      if (!paymentInitializedEvent) {
        throw new Error("Payment initialization failed")
      }

      const parsedEvent = escrowContract.interface.parseLog(paymentInitializedEvent)
      const paymentId = parsedEvent?.args?.paymentId

      // Step 2: Approve USDC allowance
      const allowance = await usdcContract.allowance(this.state.account, CONTRACT_ADDRESSES.TUITION_ESCROW)
      if (allowance < amountWei) {
        const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.TUITION_ESCROW, amountWei)
        await approveTx.wait()
      }

      // Step 3: Deposit funds
      const depositTx = await escrowContract.deposit(paymentId)
      const depositReceipt = await depositTx.wait()

      return depositReceipt.hash
    } catch (error) {
      console.error("Error creating payment:", error)
      throw error
    }
  }

  async getPaymentsByPayer(payerAddress: string): Promise<Array<Payment & { id: number }>> {
    try {
      const contract = this.getTuitionEscrowContract()
      const paymentIds = await contract.getPayerPayments(payerAddress)

      const payments = await Promise.all(
        paymentIds.map(async (id: bigint) => {
          const payment = await contract.getPayment(id)
          return {
            id: Number(id),
            payer: payment.payer,
            university: payment.university,
            amount: payment.amount,
            invoiceRef: payment.invoiceRef,
            invoiceReference: payment.invoiceRef, // Add this line to satisfy the Payment interface
            status: payment.status,
            createdAt: payment.createdAt,
            depositedAt: payment.depositedAt,
          }
        }),
      )

      return payments
    } catch (error) {
      console.error("Error fetching payments:", error)
      throw error
    }
  }

  async getAllPayments(): Promise<Array<Payment & { id: number }>> {
    try {
      const contract = this.getTuitionEscrowContract()
      const currentPaymentId = await contract.getCurrentPaymentId()

      const payments = []
      for (let i = 1; i <= currentPaymentId; i++) {
        try {
          const payment = await contract.getPayment(i)
          payments.push({
            id: i,
            payer: payment.payer,
            university: payment.university,
            amount: payment.amount,
            invoiceRef: payment.invoiceRef,
            invoiceReference: payment.invoiceRef,
            status: payment.status,
            createdAt: payment.createdAt,
            depositedAt: payment.depositedAt,
          })
        } catch (error) {
          // Skip if payment doesn't exist
          console.warn(`Payment ${i} not found:`, error)
        }
      }

      return payments
    } catch (error) {
      console.error("Error fetching all payments:", error)
      throw error
    }
  }

  async releasePayment(paymentId: number): Promise<string> {
    try {
      const contract = this.getTuitionEscrowContract()
      const tx = await contract.release(paymentId)
      const receipt = await tx.wait()
      return receipt.hash
    } catch (error) {
      console.error("Error releasing payment:", error)
      throw error
    }
  }

  async refundPayment(paymentId: number): Promise<string> {
    try {
      const contract = this.getTuitionEscrowContract()
      const tx = await contract.refund(paymentId)
      const receipt = await tx.wait()
      return receipt.hash
    } catch (error) {
      console.error("Error refunding payment:", error)
      throw error
    }
  }

  async getUSDCBalance(address: string): Promise<string> {
    try {
      if (!this.state.isConnected || !this.state.signer) {
        throw new Error("Wallet not connected")
      }
      const contract = this.getUSDCContract()
      const balance = await contract.balanceOf(address)
      return ethers.formatUnits(balance, 6)
    } catch (error) {
      console.error("Error fetching USDC balance:", error)
      throw error
    }
  }

  async getETHBalance(address: string): Promise<string> {
    try {
      if (!this.state.provider || !this.state.isConnected) {
        throw new Error("Wallet not connected")
      }
      const balance = await this.state.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error("Error fetching ETH balance:", error)
      throw error
    }
  }

  async getContractBalance(): Promise<string> {
    try {
      const contract = this.getTuitionEscrowContract()
      const balance = await contract.getContractBalance()
      return ethers.formatUnits(balance, 6)
    } catch (error) {
      console.error("Error fetching contract balance:", error)
      throw error
    }
  }

  async isPaused(): Promise<boolean> {
    try {
      const contract = this.getTuitionEscrowContract()
      return await contract.paused()
    } catch (error) {
      console.error("Error checking pause status:", error)
      return false
    }
  }

  // Utility functions
  formatAmount(amount: bigint): string {
    return ethers.formatUnits(amount, 6)
  }

  parseAmount(amount: string): bigint {
    return ethers.parseUnits(amount, 6)
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address)
  }

  // Gas estimation
  async estimateGasForPayment(
    universityAddress: string,
    amount: string,
  ): Promise<{
    gasLimit: bigint
    gasPrice: bigint
    estimatedCost: string
  }> {
    try {
      const escrowContract = this.getTuitionEscrowContract()
      const amountWei = ethers.parseUnits(amount, 6)

      // Estimate gas for initialization
      const gasLimit = await escrowContract.initialize.estimateGas(
        this.state.account,
        universityAddress,
        amountWei,
        "ESTIMATE",
      )

      // Get current gas price
      const feeData = await this.state.provider!.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei")

      // Calculate estimated cost in ETH (multiply by 2 for both initialize and deposit)
      const estimatedCostWei = gasLimit * gasPrice * BigInt(2)
      const estimatedCost = ethers.formatEther(estimatedCostWei)

      return {
        gasLimit,
        gasPrice,
        estimatedCost,
      }
    } catch (error) {
      console.error("Error estimating gas:", error)
      throw error
    }
  }

  async getNetwork(): Promise<string> {
    try {
      if (!this.state.provider) {
        throw new Error("Provider not available")
      }
      const network = await this.state.provider.getNetwork()
      return network.name
    } catch (error) {
      console.error("Error getting network:", error)
      return "unknown"
    }
  }

  // Listen for contract events
  setupEventListeners(
    onPaymentInitialized?: (event: any) => void,
    onDeposited?: (event: any) => void,
    onReleased?: (event: any) => void,
    onRefunded?: (event: any) => void,
  ) {
    try {
      const contract = this.getTuitionEscrowContract()

      if (onPaymentInitialized) {
        contract.on("PaymentInitialized", onPaymentInitialized)
      }

      if (onDeposited) {
        contract.on("Deposited", onDeposited)
      }

      if (onReleased) {
        contract.on("Released", onReleased)
      }

      if (onRefunded) {
        contract.on("Refunded", onRefunded)
      }
    } catch (error) {
      console.error("Error setting up event listeners:", error)
    }
  }

  // Clean up event listeners
  removeEventListeners() {
    try {
      const contract = this.getTuitionEscrowContract()
      contract.removeAllListeners()
    } catch (error) {
      console.error("Error removing event listeners:", error)
    }
  }
}

// Export singleton instance
export const web3Service = Web3Service.getInstance()
