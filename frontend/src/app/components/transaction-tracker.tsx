"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { web3Service } from "@/lib/web3"

interface Transaction {
  hash: string
  type: "payment" | "release" | "refund" | "approval"
  status: "pending" | "confirmed" | "failed"
  timestamp: number
  amount?: string
  paymentId?: string
}

interface TransactionTrackerProps {
  userAddress: string
}

export function TransactionTracker({ userAddress }: TransactionTrackerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem(`transactions_${userAddress}`)
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }

    // Set up event listeners for new transactions
    const handlePaymentCreated = (
      paymentId: any,
      payer: string,
      university: string,
      amount: any,
      invoiceRef: string,
      event: any,
    ) => {
      if (payer.toLowerCase() === userAddress.toLowerCase()) {
        addTransaction({
          hash: event.transactionHash,
          type: "payment",
          status: "confirmed",
          timestamp: Date.now(),
          amount: web3Service.formatAmount(amount),
          paymentId: paymentId.toString(),
        })

        toast.success("Payment Confirmed", {
          description: `Payment #${paymentId} has been confirmed on the blockchain`,
        })
      }
    }

    const handlePaymentReleased = (paymentId: any, university: string, amount: any, event: any) => {
      addTransaction({
        hash: event.transactionHash,
        type: "release",
        status: "confirmed",
        timestamp: Date.now(),
        amount: web3Service.formatAmount(amount),
        paymentId: paymentId.toString(),
      })
    }

    const handlePaymentRefunded = (paymentId: any, payer: string, amount: any, event: any) => {
      if (payer.toLowerCase() === userAddress.toLowerCase()) {
        addTransaction({
          hash: event.transactionHash,
          type: "refund",
          status: "confirmed",
          timestamp: Date.now(),
          amount: web3Service.formatAmount(amount),
          paymentId: paymentId.toString(),
        })

        toast.success("Payment Refunded", {
          description: `Payment #${paymentId} has been refunded`,
        })
      }
    }

    web3Service.setupEventListeners(handlePaymentCreated, handlePaymentReleased, handlePaymentRefunded)

    return () => {
      web3Service.removeEventListeners()
    }
  }, [userAddress])

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => {
      const updated = [transaction, ...prev].slice(0, 10) // Keep only last 10 transactions
      localStorage.setItem(`transactions_${userAddress}`, JSON.stringify(updated))
      return updated
    })
  }

  const getStatusIcon = (status: string, type: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "payment":
        return "Payment Created"
      case "release":
        return "Payment Released"
      case "refund":
        return "Payment Refunded"
      case "approval":
        return "USDC Approval"
      default:
        return "Transaction"
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "payment":
        return <Badge className="bg-blue-950/50 border border-blue-800/50 text-blue-400 text-xs">Payment</Badge>
      case "release":
        return <Badge className="bg-green-950/50 border border-green-800/50 text-green-400 text-xs">Release</Badge>
      case "refund":
        return <Badge className="bg-red-950/50 border border-red-800/50 text-red-400 text-xs">Refund</Badge>
      case "approval":
        return <Badge className="bg-purple-950/50 border border-purple-800/50 text-purple-400 text-xs">Approval</Badge>
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Unknown
          </Badge>
        )
    }
  }

  const viewOnExplorer = (hash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank")
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
      <CardHeader data-slot="header">
        <CardTitle className="text-white font-light text-lg" data-slot="title">
          Recent Transactions
        </CardTitle>
        <CardDescription className="text-neutral-400 font-light" data-slot="description">
          Your latest blockchain transactions
        </CardDescription>
      </CardHeader>
      <CardContent data-slot="content">
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={`${tx.hash}-${index}`}
              className="flex items-center justify-between p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/30"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(tx.status, tx.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{getTypeLabel(tx.type)}</span>
                    {getTypeBadge(tx.type)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-mono">
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                    </span>
                    {tx.paymentId && <span>• Payment #{tx.paymentId}</span>}
                    {tx.amount && <span>• ${tx.amount} USDC</span>}
                  </div>
                  <div className="text-xs text-neutral-500">{new Date(tx.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewOnExplorer(tx.hash)}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                data-slot="button"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
