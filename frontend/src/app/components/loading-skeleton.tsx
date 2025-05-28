"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PaymentFormSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardHeader data-slot="header">
            <div className="animate-pulse">
              <div className="h-6 bg-neutral-800 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-neutral-800 rounded w-2/3"></div>
            </div>
          </CardHeader>
          <CardContent data-slot="content">
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                  <div className="h-12 bg-neutral-800 rounded"></div>
                </div>
              ))}
              <div className="h-12 bg-neutral-800 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
          <CardHeader data-slot="header">
            <div className="animate-pulse">
              <div className="h-5 bg-neutral-800 rounded w-1/2"></div>
            </div>
          </CardHeader>
          <CardContent data-slot="content">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-neutral-800 rounded"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-neutral-800 rounded w-1/3"></div>
                    <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function PaymentHistorySkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
            <CardContent className="pt-6" data-slot="content">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-800 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-neutral-800 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
        <CardHeader data-slot="header">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-neutral-800 rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent data-slot="content">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="h-10 bg-neutral-800 rounded flex-1"></div>
              <div className="h-10 bg-neutral-800 rounded w-40"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-neutral-800 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
            <CardContent className="pt-6" data-slot="content">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-800 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-neutral-800 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-neutral-950/50 border-neutral-800/50 backdrop-blur-sm" data-slot="card">
        <CardHeader data-slot="header">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-neutral-800 rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent data-slot="content">
          <div className="animate-pulse space-y-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-neutral-800 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
