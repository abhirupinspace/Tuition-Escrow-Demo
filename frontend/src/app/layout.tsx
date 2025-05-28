import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "@/lib/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduPay Global - Cross-Border Education Payments",
  description: "Secure cross-border payment system for education using stablecoins",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster theme="dark" position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
