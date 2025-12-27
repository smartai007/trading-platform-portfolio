"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveSession } from "@/lib/auth"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user just registered
    if (searchParams.get('registered') === 'true') {
      setSuccess("Account created successfully! Please sign in.")
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    setError("") // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      // Save session to localStorage
      saveSession(data.user)

      // Success - redirect to dashboard
      router.push("/")
    } catch (err) {
      setError("Failed to sign in. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="font-mono text-3xl font-bold text-primary">Freedomtracker</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to your trading account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="trader@example.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
