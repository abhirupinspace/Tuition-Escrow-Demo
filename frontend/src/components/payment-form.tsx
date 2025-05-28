"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { GraduationCap, DollarSign, FileText, Send, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { web3Service } from "@/lib/web3"
import { PaymentFormSkeleton } from "./loading-skeleton"

interface PaymentFormProps {
  userAddress: string
}

const universities = [
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    country: "United States",
    address: "0x1234567890123456789012345678901234567890",
    ranking: "#1",
    students: "11,000+",
  },
  {
    id: "oxford",
    name: "University of Oxford",
    country: "United Kingdom",
    address: "0x2345678901234567890123456789012345678901",
    ranking: "#2",
    students: "24,000+",
  },
  {
    id: "stanford",
    name: "Stanford University",
    country: "United States",
    address: "0x3456789012345678901234567890123456789012",
    ranking: "#3",
    students: "17,000+",
  },
  {
    id: "cambridge",
    name: "University of Cambridge",
    country: "United Kingdom",
    address: "0x4567890123456789012345678901234567890123",
    ranking: "#4",
    students: "23,000+",
  },
  {
    id: "eth",
    name: "ETH Zurich",
    country: "Switzerland",
    address: "0x5678901234567890123456789012345678901234",
    ranking: "#7",
    students: "22,000+",
  },
]

export function PaymentForm({ userAddress }: PaymentFormProps) {
  const [isComponentLoading, setIsComponentLoading] = useState(true)
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [amount, setAmount] = useState("")
  const [invoiceRef, setInvoiceRef] = useState("")
  const [description, setDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<string>("0")
  const [isApproving, setIsApproving] = useState(false)
  const [ethBalance, setEthBalance] = useState<string>("0")
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: bigint
    gasPrice: bigint
    estimatedCost: string
  } | null>(null)
  const [isEstimatingGas, setIsEstimatingGas] = useState(false)

  useEffect(() => {
    // Simulate component loading
    const timer = setTimeout(() => {
      setIsComponentLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchBalances()
  }, [userAddress])

  const fetchBalances = async () => {
    try {
      const [usdcBal, ethBal] = await Promise.all([
        web3Service.getUSDCBalance(userAddress),
        web3Service.getETHBalance(userAddress),
      ])
      setUsdcBalance(usdcBal)
      setEthBalance(ethBal)
    } catch (error) {
      console.error("Error fetching balances:", error)
    }
  }

  const validateForm = () => {
    if (!selectedUniversity) {
      toast.error("Missing Information", {
        description: "Please select a university",
      })
      return false
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount greater than 0",
      })
      return false
    }

    if (!invoiceRef.trim()) {
      toast.error("Missing Information", {
        description: "Please enter an invoice reference",
      })
      return false
    }

    const amountNum = Number.parseFloat(amount)
    const balanceNum = Number.parseFloat(usdcBalance)

    if (amountNum > balanceNum) {
      toast.error("Insufficient Balance", {
        description: `You need ${amountNum.toFixed(2)} USDC but only have ${balanceNum.toFixed(2)} USDC`,
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsProcessing(true)

    try {
      const selectedUni = universities.find((u) => u.id === selectedUniversity)
      if (!selectedUni) {
        throw new Error("University not found")
      }

      // Show loading toast
      const loadingToast = toast.loading("Creating Payment", {
        description: "Preparing transaction...",
      })

      // Create payment through smart contract
      const txHash = await web3Service.createPayment(selectedUni.address, amount, invoiceRef)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Show success toast
      toast.success("Payment Created Successfully", {
        description: `Payment of ${amount} USDC to ${selectedUni.name} has been secured in escrow`,
        action: {
          label: "View Transaction",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank"),
        },
      })

      // Reset form
      setSelectedUniversity("")
      setAmount("")
      setInvoiceRef("")
      setDescription("")

      // Refresh balance
      await fetchBalances()
    } catch (error: any) {
      console.error("Payment creation error:", error)

      let errorMessage = "There was an error processing your payment. Please try again."

      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction fees"
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was cancelled by user"
      } else if (error.message.includes("Insufficient USDC balance")) {
        errorMessage = "Insufficient USDC balance"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error("Payment Failed", {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (selectedUniversity && amount && Number.parseFloat(amount) > 0) {
      estimateGas()
    } else {
      setGasEstimate(null)
    }
  }, [selectedUniversity, amount])

  const estimateGas = async () => {
    if (!selectedUniversity || !amount) return

    setIsEstimatingGas(true)
    try {
      const selectedUni = universities.find((u) => u.id === selectedUniversity)
      if (selectedUni) {
        const estimate = await web3Service.estimateGasForPayment(selectedUni.address, amount)
        setGasEstimate(estimate)
      }
    } catch (error) {
      console.error("Error estimating gas:", error)
      setGasEstimate(null)
    } finally {
      setIsEstimatingGas(false)
    }
  }

  const selectedUni = universities.find((u) => u.id === selectedUniversity)
  const amountNum = Number.parseFloat(amount) || 0
  const balanceNum = Number.parseFloat(usdcBalance)
  const hasInsufficientBalance = amountNum > balanceNum
  const estimatedGasFee = 2.5 // Estimated gas fee in USD

  if (isComponentLoading) {
    return <PaymentFormSkeleton />
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardHeader data-slot="header">
            <CardTitle className="flex items-center gap-3 text-white text-xl font-light" data-slot="title">
              <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-neutral-400" />
              </div>
              New Payment
            </CardTitle>
            <CardDescription className="text-neutral-400 font-light" data-slot="description">
              Send tuition fees or donations to universities worldwide using USDC
            </CardDescription>
          </CardHeader>
          <CardContent data-slot="content">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* University Selection */}
              <div className="space-y-2">
                <Label htmlFor="university" className="text-white font-light" data-slot="label">
                  University *
                </Label>
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger
                    className="bg-neutral-950/50 border-neutral-800/50 text-white h-12 rounded-lg"
                    data-slot="trigger"
                  >
                    <SelectValue placeholder="Select a university" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl"
                    data-slot="content"
                  >
                    {universities.map((uni) => (
                      <SelectItem
                        key={uni.id}
                        value={uni.id}
                        className="text-white hover:bg-neutral-900/50 p-3"
                        data-slot="item"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-1">
                            <div className="font-medium text-white">{uni.name}</div>
                            <div className="text-sm text-neutral-400 flex items-center gap-3">
                              <span>{uni.country}</span>
                              <Badge className="bg-neutral-800 text-neutral-300 text-xs font-light" data-slot="badge">
                                {uni.ranking}
                              </Badge>
                              <span>{uni.students}</span>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white font-light" data-slot="label">
                  Amount *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`pl-10 pr-16 h-12 bg-neutral-950/50 border-neutral-800/50 text-white rounded-lg ${
                      hasInsufficientBalance ? "border-red-500/50" : ""
                    }`}
                    step="0.01"
                    min="0"
                    data-slot="input"
                  />
                  <Badge
                    className="absolute right-3 top-3 bg-neutral-800 text-neutral-300 px-2 py-1 text-xs font-light"
                    data-slot="badge"
                  >
                    USDC
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div className="text-neutral-400">Available: {Number.parseFloat(usdcBalance).toFixed(2)} USDC</div>
                    <div className="text-neutral-400">ETH Balance: {Number.parseFloat(ethBalance).toFixed(4)} ETH</div>
                  </div>
                  {hasInsufficientBalance && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Insufficient balance
                    </span>
                  )}
                </div>
              </div>

              {/* Invoice Reference */}
              <div className="space-y-2">
                <Label htmlFor="invoiceRef" className="text-white font-light" data-slot="label">
                  Invoice Reference *
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                  <Input
                    id="invoiceRef"
                    placeholder="e.g., TUITION-2024-SPRING"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="pl-10 h-12 bg-neutral-950/50 border-neutral-800/50 text-white rounded-lg"
                    data-slot="input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-light" data-slot="label">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Additional notes about this payment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-neutral-950/50 border-neutral-800/50 text-white rounded-lg resize-none"
                  data-slot="textarea"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-medium bg-white text-black hover:bg-neutral-100 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || hasInsufficientBalance}
                data-slot="button"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-black rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Create Payment
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Payment Summary */}
        {selectedUni && amount && (
          <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
            <CardHeader data-slot="header">
              <CardTitle className="text-white font-light" data-slot="title">
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-slot="content">
              <div className="p-4 bg-neutral-900/30 rounded-lg border border-neutral-800/30">
                <div className="font-medium text-white">{selectedUni.name}</div>
                <div className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                  <span>{selectedUni.country}</span>
                  <Badge className="bg-neutral-800 text-neutral-300 text-xs font-light" data-slot="badge">
                    {selectedUni.ranking}
                  </Badge>
                </div>
                <div className="text-xs text-neutral-500 mt-2 font-mono">
                  {selectedUni.address.slice(0, 6)}...{selectedUni.address.slice(-4)}
                </div>
              </div>

              <Separator className="bg-neutral-800/50" data-slot="separator" />

              <div className="space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span className="font-light">Amount:</span>
                  <span className="text-white">{amount} USDC</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span className="font-light">Gas Fee:</span>
                  <span className="text-white">
                    {isEstimatingGas ? (
                      <div className="w-4 h-4 border border-neutral-400 border-t-white rounded-full animate-spin inline-block"></div>
                    ) : gasEstimate ? (
                      `~${Number.parseFloat(gasEstimate.estimatedCost).toFixed(4)} ETH`
                    ) : (
                      "~0.002 ETH"
                    )}
                  </span>
                </div>
                <Separator className="bg-neutral-800/50" data-slot="separator" />
                <div className="flex justify-between font-medium">
                  <span className="text-white">Total:</span>
                  <span className="text-white">{amount ? `${amount} USDC + Gas` : "0.00 USDC"}</span>
                </div>
              </div>

              {hasInsufficientBalance && (
                <div className="p-3 bg-red-950/20 border border-red-800/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Insufficient USDC balance</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-neutral-950/30 border-neutral-800/30 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Secure Escrow</h4>
                <p className="text-sm text-neutral-400 leading-relaxed font-light">
                  Your payment is protected by smart contract escrow. Funds are held securely until verified and
                  released by our admin team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Info */}
        <Card className="bg-neutral-950/30 border-neutral-800/30 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Smart Contract</h4>
                <p className="text-sm text-neutral-400 leading-relaxed font-light">
                  Powered by verified smart contracts on Sepolia testnet. All transactions are transparent and
                  auditable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
