"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

import { AdminDashboardSkeleton } from "./loading-skeleton"
import { CONTRACT_ADDRESSES, Payment, PaymentStatus, web3Service } from "../../lib/web3"
import { useReleasePayment, useRefundPayment } from "../../lib/web3-wagmi"

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 1,
    payer: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1",
    university: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    amount: BigInt("1500000000"), // 1500 USDC
    invoiceRef: "TUITION-2024-001",
    invoiceReference: "TUITION-2024-001",
    status: PaymentStatus.PENDING,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3), // 3 days ago
    depositedAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 2), // 2 days ago
  },
  {
    id: 2,
    payer: "0x8832d13Aa4E52925a3b8D4C9db96C4b4d8b1Cc66",
    university: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    amount: BigInt("2500000000"), // 2500 USDC
    invoiceRef: "TUITION-2024-002",
    invoiceReference: "TUITION-2024-002",
    status: PaymentStatus.PENDING,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400), // 1 day ago
    depositedAt: BigInt(Math.floor(Date.now() / 1000) - 43200), // 12 hours ago
  }
]

export function AdminDashboard() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [actionReason, setActionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { release, isPending: isReleasing, isConfirmed: isReleased } = useReleasePayment()
  const { refund, isPending: isRefunding, isConfirmed: isRefunded } = useRefundPayment()

  useEffect(() => {
    fetchAllPayments()
  }, [])

  const fetchAllPayments = async () => {
    setIsLoading(true)
    try {
      let fetchedPayments: Payment[] = []
      
      try {
        fetchedPayments = await web3Service.getAllPayments()
      } catch (error) {
        console.warn("Failed to fetch real payments, using mock data:", error)
        fetchedPayments = MOCK_PAYMENTS
      }

      // Combine real and mock payments for demo
      const combinedPayments = [...fetchedPayments]
      
      // Sort by creation date
      combinedPayments.sort((a, b) => 
        Number(b.createdAt) - Number(a.createdAt)
      )

      setAllPayments(combinedPayments)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to Load Payments", {
        description: "Could not fetch payment data. Please try again.",
      })
      // Fallback to mock data on error
      setAllPayments(MOCK_PAYMENTS)
    } finally {
      setIsLoading(false)
    }
  }

  const pendingPayments = allPayments.filter((p) => p.status === PaymentStatus.PENDING)
  const totalVolume = allPayments.reduce((sum, p) => sum + Number.parseFloat(web3Service.formatAmount(p.amount)), 0)
  const successRate =
    allPayments.length > 0
      ? ((allPayments.filter((p) => p.status === PaymentStatus.RELEASED).length / allPayments.length) * 100).toFixed(1)
      : "0"

  const handleRelease = async (paymentId: bigint) => {
    try {
      toast.loading("Processing release...", { id: "release" })
      await release(paymentId) // Remove Number conversion
      
      // Update UI comparison to use bigint
      setAllPayments(prev => prev.map(p => 
        BigInt(p.id) === paymentId
          ? { ...p, status: PaymentStatus.RELEASED }
          : p
      ))

      toast.success("Payment Released", {
        description: `Payment #${paymentId.toString()} has been released to the university`,
      })
    } catch (error: any) {
      toast.error("Release Failed", {
        description: error.message || "Failed to release payment.",
      })
    }
  }

  const handleRefund = async (paymentId: bigint) => {
    try {
      toast.loading("Processing refund...", { id: "refund" })
      await refund(paymentId) // Remove Number conversion

      // Update UI comparison to use bigint
      setAllPayments(prev => prev.map(p => 
        BigInt(p.id) === paymentId
          ? { ...p, status: PaymentStatus.REFUNDED }
          : p
      ))

      toast.success("Payment Refunded", {
        description: `Payment #${paymentId.toString()} has been refunded to the payer`,
      })
    } catch (error: any) {
      toast.error("Refund Failed", {
        description: error.message || "Failed to refund payment.",
      })
    }
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  if (isLoading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-neutral-400">Pending Review</p>
                <p className="text-2xl font-light text-white">{pendingPayments.length}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-950/50 border border-yellow-800/50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-neutral-400">Total Volume</p>
                <p className="text-2xl font-light text-white">${totalVolume.toFixed(0)}</p>
              </div>
              <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-neutral-400">Total Payments</p>
                <p className="text-2xl font-light text-white">{allPayments.length}</p>
              </div>
              <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-neutral-400">Success Rate</p>
                <p className="text-2xl font-light text-white">{successRate}%</p>
              </div>
              <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
        <CardHeader data-slot="header">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-white font-light" data-slot="title">
                <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-neutral-400" />
                </div>
                Pending Payments
              </CardTitle>
              <CardDescription className="text-neutral-400 font-light" data-slot="description">
                Review and approve or refund pending payments
              </CardDescription>
            </div>
            <Button
              onClick={fetchAllPayments}
              size="sm"
              variant="outline"
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-900/50"
              data-slot="button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent data-slot="content">
          <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800/50 hover:bg-neutral-900/20">
                  <TableHead className="text-neutral-400 font-light">Payment ID</TableHead>
                  <TableHead className="text-neutral-400 font-light">Payer</TableHead>
                  <TableHead className="text-neutral-400 font-light">University</TableHead>
                  <TableHead className="text-neutral-400 font-light">Amount</TableHead>
                  <TableHead className="text-neutral-400 font-light">Date</TableHead>
                  <TableHead className="text-neutral-400 font-light">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-400">
                      No pending payments
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingPayments.map((payment) => (
                    <TableRow key={payment.id.toString()} className="border-neutral-800/50 hover:bg-neutral-900/20">
                      <TableCell className="font-mono text-sm text-neutral-300">#{payment.id.toString()}</TableCell>
                      <TableCell className="font-mono text-sm text-white">{formatAddress(payment.payer)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{formatAddress(payment.university)}</div>
                          <div className="text-sm text-neutral-400">{payment.invoiceReference}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white">${web3Service.formatAmount(payment.amount)}</div>
                        <div className="text-sm text-neutral-400">USDC</div>
                      </TableCell>
                      <TableCell className="text-neutral-300">{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                              className="bg-white text-black hover:bg-neutral-100"
                              data-slot="button"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="max-w-lg bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl text-white"
                            data-slot="content"
                          >
                            <DialogHeader data-slot="header">
                              <DialogTitle className="text-xl font-light" data-slot="title">
                                Review Payment
                              </DialogTitle>
                              <DialogDescription className="text-neutral-400 font-light" data-slot="description">
                                Review payment details and choose an action
                              </DialogDescription>
                            </DialogHeader>

                            {selectedPayment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-900/30 rounded-lg border border-neutral-800/30">
                                  <div>
                                    <span className="text-sm font-light text-neutral-400">Payment ID:</span>
                                    <p className="font-mono text-white">#{selectedPayment.id.toString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-light text-neutral-400">Amount:</span>
                                    <p className="font-medium text-white">
                                      ${web3Service.formatAmount(selectedPayment.amount)} USDC
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-sm font-light text-neutral-400">Payer:</span>
                                    <p className="font-mono text-white">{selectedPayment.payer}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-sm font-light text-neutral-400">University:</span>
                                    <p className="font-mono text-white">{selectedPayment.university}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-sm font-light text-neutral-400">Invoice Reference:</span>
                                    <p className="text-white">{selectedPayment.invoiceReference}</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-light text-neutral-400">
                                    Action Reason (Optional)
                                  </label>
                                  <Textarea
                                    placeholder="Add a note about this action..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    rows={3}
                                    className="bg-neutral-950/50 border-neutral-800/50 text-white rounded-lg resize-none"
                                    data-slot="textarea"
                                  />
                                </div>
                              </div>
                            )}

                            <DialogFooter className="flex gap-3" data-slot="footer">
                              <Button
                                variant="outline"
                                onClick={() => selectedPayment && handleRefund(BigInt(selectedPayment.id))}
                                disabled={isRefunding}
                                className="border-neutral-800 text-neutral-300 hover:bg-neutral-900/50"
                                data-slot="button"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Refund
                              </Button>
                              <Button
                                onClick={() => selectedPayment && handleRelease(BigInt(selectedPayment.id))}
                                disabled={isReleasing}
                                className="bg-white text-black hover:bg-neutral-100"
                                data-slot="button"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {isReleasing ? "Processing..." : "Release"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-neutral-950/30 border-neutral-800/30 backdrop-blur-sm" data-slot="card">
        <CardContent className="pt-6" data-slot="content">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Admin Guidelines</h4>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                All administrative actions are permanently logged on the blockchain. Please verify payment details
                before taking action. Contract address: {formatAddress(CONTRACT_ADDRESSES.TUITION_ESCROW)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}