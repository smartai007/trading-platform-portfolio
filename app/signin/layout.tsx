import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - Freedomtracker",
  description: "Sign in to your trading account",
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
