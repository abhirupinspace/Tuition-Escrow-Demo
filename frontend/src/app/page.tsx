"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnection } from "./components/wallet-connection"
import { PaymentForm } from "./components/payment-form"
import { AdminDashboard } from "./components/admin-dashboard"
import { PaymentHistory } from "./components/payment-history"
import { FloatingElements } from "./components/floating-elements"
import { GraduationCap, Shield, Globe, ArrowRight, Zap, Lock } from "lucide-react"
import { TransactionTracker } from "./components/transaction-tracker"
import { useAccount } from "wagmi"
import { DebugPanel } from "./components/debug-panel"

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Mock admin address
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0xC8df9cB27dD2736424333176323C1Bcef22E521A"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (address) {
      setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase())
    }
  }, [address, adminAddress])

  const handleWalletConnect = (address: string) => {
    // This is now handled by Wagmi automatically
  }

  const handleWalletDisconnect = () => {
    // This is now handled by Wagmi automatically
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
      <FloatingElements />

      {/* Header */}
      <header className="border-b border-neutral-800/50 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-neutral-100 to-neutral-300 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-neutral-900" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-medium text-white tracking-tight">EduPay</h1>
              <p className="text-xs text-neutral-500 font-light">Cross-border payments</p>
            </div>
          </div>
          <WalletConnection
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
            isConnected={isConnected}
            userAddress={address || ""}
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative z-10">
        {!isConnected ? (
          // Landing Page
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20 animate-fade-in">
              <div className="mb-8">
                <h2 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
                  Global Education
                  <span className="block text-neutral-400 mt-2">Payments</span>
                </h2>
                <p className="text-lg text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                  Secure, transparent stablecoin payments to universities worldwide. Built on blockchain technology for
                  trust and efficiency.
                </p>
              </div>

              <div className="flex items-center justify-center gap-12 text-sm text-neutral-500 mb-16">
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center group-hover:border-neutral-700 transition-colors duration-300">
                    <Shield className="w-5 h-5 text-neutral-400" />
                  </div>
                  <span className="font-light">Secure Escrow</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center group-hover:border-neutral-700 transition-colors duration-300">
                    <Zap className="w-5 h-5 text-neutral-400" />
                  </div>
                  <span className="font-light">Instant Settlement</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center group-hover:border-neutral-700 transition-colors duration-300">
                    <Globe className="w-5 h-5 text-neutral-400" />
                  </div>
                  <span className="font-light">Global Network</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  step: "01",
                  title: "Connect",
                  description: "Link your Web3 wallet for secure authentication",
                  icon: Lock,
                },
                {
                  step: "02",
                  title: "Select",
                  description: "Choose from our network of partner universities",
                  icon: GraduationCap,
                },
                {
                  step: "03",
                  title: "Transfer",
                  description: "Secure payment held in smart contract escrow",
                  icon: Shield,
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm hover:bg-neutral-950/70 transition-all duration-500 group"
                  data-slot="card"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center pb-4" data-slot="header">
                    <div className="relative mx-auto mb-6">
                      <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center group-hover:border-neutral-700 transition-colors duration-300">
                        <item.icon className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-medium">
                        {item.step}
                      </div>
                    </div>
                    <CardTitle
                      className="text-lg text-white font-medium group-hover:text-neutral-200 transition-colors duration-300"
                      data-slot="title"
                    >
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent data-slot="content">
                    <p className="text-neutral-400 text-center leading-relaxed font-light">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-100 px-8 py-6 text-base font-medium rounded-xl transition-all duration-300 group"
                data-slot="button"
              >
                <span className="flex items-center gap-3">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        ) : (
          // Connected User Interface
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-white mb-2">Dashboard</h2>
                  <p className="text-neutral-400 flex items-center gap-2 font-light">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                {isAdmin && (
                  <Badge
                    className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1.5 text-sm font-light"
                    data-slot="badge"
                  >
                    <Shield className="w-3 h-3 mr-2" />
                    Administrator
                  </Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue={isAdmin ? "admin" : "payment"} className="w-full " data-slot="tabs">
              <TabsList
                className="grid w-full grid-cols-3 bg-neutral-950/50 border border-neutral-800/50 backdrop-blur-sm p-1 rounded-xl"
                data-slot="list"
              >
                <TabsTrigger
                  value="payment"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 rounded-lg transition-all duration-300 font-light"
                  data-slot="trigger"
                >
                  Payment
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 rounded-lg transition-all duration-300 font-light"
                  data-slot="trigger"
                >
                  History
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger
                    value="admin"
                    className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 rounded-lg transition-all duration-300 font-light"
                    data-slot="trigger"
                  >
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="payment" className="mt-8" data-slot="content">
                <PaymentForm userAddress={address || ""} />
              </TabsContent>

              <TabsContent value="history" className="mt-8" data-slot="content">
                  <PaymentHistory userAddress={address || ""} />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="mt-8" data-slot="content">
                  <AdminDashboard />
                </TabsContent>
              )}
            </Tabs>

            <div className="mt-8">
              <TransactionTracker userAddress={address || ""} />
            </div>
            {isConnected && <DebugPanel />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 bg-black/20 backdrop-blur-2xl mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-neutral-400 mb-2 font-light">EduPay — Global Education Payments</p>
            <p className="text-sm text-neutral-600 font-light">Secure • Transparent • Efficient</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
