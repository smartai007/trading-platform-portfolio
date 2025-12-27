import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Suspense } from "react"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "freedomtracker - Trading Management Platform",
  description: "Professional trading management platform with AI-powered insights",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ProtectedRoute>
          <div className="flex h-screen overflow-hidden">
            <Suspense fallback={<div>Loading...</div>}>
              <Sidebar />
            </Suspense>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </ProtectedRoute>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
