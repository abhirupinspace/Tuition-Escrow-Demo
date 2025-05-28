"use client"

import { useEffect } from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, ExternalLink, Clock, CheckCircle, XCircle, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { web3Service, PaymentStatus, type Payment } from "@/lib/web3"
import { PaymentHistorySkeleton } from "./loading-skeleton"
import { useAccount } from "wagmi"
import { usePayerPayments } from "@/lib/web3-wagmi"

interface PaymentHistoryProps {
  userAddress: string
}

export function PaymentHistory({ userAddress }: PaymentHistoryProps) {
  const { address } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get payment IDs for the user
  const { data: paymentIds, isLoading: isLoadingPayments, refetch } = usePayerPayments(address)

  // You'll need to fetch individual payments based on the IDs
  // This would require multiple usePayment hooks or a custom hook

  useEffect(() => {
    if (userAddress) {
      fetchPayments()
    }
  }, [userAddress])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const userPayments = await web3Service.getPaymentsByPayer(userAddress)
      setPayments(userPayments)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to Load Payments", {
        description: "Could not fetch payment history. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.RELEASED:
        return (
          <Badge className="bg-green-950/50 border border-green-800/50 text-green-400 font-light" data-slot="badge">
            <CheckCircle className="w-3 h-3 mr-1" />
            Released
          </Badge>
        )
      case PaymentStatus.PENDING:
        return (
          <Badge className="bg-yellow-950/50 border border-yellow-800/50 text-yellow-400 font-light" data-slot="badge">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case PaymentStatus.REFUNDED:
        return (
          <Badge className="bg-red-950/50 border border-red-800/50 text-red-400 font-light" data-slot="badge">
            <XCircle className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusString = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.RELEASED:
        return "released"
      case PaymentStatus.PENDING:
        return "pending"
      case PaymentStatus.REFUNDED:
        return "refunded"
      default:
        return "unknown"
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.invoiceReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toString().includes(searchTerm.toLowerCase()) ||
      payment.university.toLowerCase().includes(searchTerm.toLowerCase())

    const statusString = getStatusString(payment.status)
    const matchesStatus = statusFilter === "all" || statusString === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalReleased = payments
    .filter((p) => p.status === PaymentStatus.RELEASED)
    .reduce((sum, p) => sum + Number.parseFloat(web3Service.formatAmount(p.amount)), 0)

  const totalPending = payments
    .filter((p) => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + Number.parseFloat(web3Service.formatAmount(p.amount)), 0)

  const viewOnExplorer = (paymentId: bigint) => {
    // For now, we'll link to the contract address since we don't have individual transaction hashes
    // In a real implementation, you'd store transaction hashes when payments are created
    window.open(`https://sepolia.etherscan.io/address/${web3Service.getTuitionEscrowContract().target}`, "_blank")
    toast.success("Opening Explorer", {
      description: "Redirecting to Etherscan",
    })
  }

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading || isLoadingPayments) {
    return <PaymentHistorySkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-neutral-400">Total Released</p>
                <p className="text-2xl font-light text-white">${totalReleased.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-green-950/50 border border-green-800/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardContent className="pt-6" data-slot="content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-neutral-400">Pending Release</p>
                <p className="text-2xl font-light text-white">${totalPending.toFixed(2)}</p>
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
                <p className="text-sm font-light text-neutral-400">Total Payments</p>
                <p className="text-2xl font-light text-white">{payments.length}</p>
              </div>
              <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Payment History */}
      <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
        <CardHeader data-slot="header">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white font-light flex items-center gap-3" data-slot="title">
                <Calendar className="w-5 h-5 text-neutral-400" />
                Payment History
              </CardTitle>
              <CardDescription className="text-neutral-400 font-light" data-slot="description">
                Track all your payments and their current status
              </CardDescription>
            </div>
            <Button
              onClick={fetchPayments}
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
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-neutral-950/50 border-neutral-800/50 text-white rounded-lg"
                data-slot="input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-full sm:w-40 h-10 bg-neutral-950/50 border-neutral-800/50 text-white rounded-lg"
                data-slot="trigger"
              >
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950/95 border-neutral-800/50 backdrop-blur-xl" data-slot="content">
                <SelectItem value="all" className="text-white hover:bg-neutral-900/50" data-slot="item">
                  All Status
                </SelectItem>
                <SelectItem value="pending" className="text-white hover:bg-neutral-900/50" data-slot="item">
                  Pending
                </SelectItem>
                <SelectItem value="released" className="text-white hover:bg-neutral-900/50" data-slot="item">
                  Released
                </SelectItem>
                <SelectItem value="refunded" className="text-white hover:bg-neutral-900/50" data-slot="item">
                  Refunded
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800/50 hover:bg-neutral-900/20">
                  <TableHead className="text-neutral-400 font-light">Payment</TableHead>
                  <TableHead className="text-neutral-400 font-light">University</TableHead>
                  <TableHead className="text-neutral-400 font-light">Amount</TableHead>
                  <TableHead className="text-neutral-400 font-light">Status</TableHead>
                  <TableHead className="text-neutral-400 font-light">Date</TableHead>
                  <TableHead className="text-neutral-400 font-light">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-400">
                      {payments.length === 0 ? "No payments found" : "No payments match your search"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id.toString()} className="border-neutral-800/50 hover:bg-neutral-900/20">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm text-neutral-300">#{payment.id.toString()}</div>
                          <div className="text-sm text-neutral-400">{payment.invoiceReference}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white">{formatAddress(payment.university)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white">${web3Service.formatAmount(payment.amount)}</div>
                        <div className="text-sm text-neutral-400">USDC</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-neutral-300">{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewOnExplorer(payment.id)}
                          className="text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                          data-slot="button"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
