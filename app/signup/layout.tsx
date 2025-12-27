import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Freedomtracker",
  description: "Create your trading account",
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
