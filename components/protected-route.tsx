"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

const PUBLIC_ROUTES = ['/signin', '/signup', '/forgot-password']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
      const authenticated = isAuthenticated()

      if (!isPublicRoute && !authenticated) {
        router.push('/signin')
      } else if (isPublicRoute && authenticated) {
        // If user is already logged in and tries to access signin/signup, redirect to home
        router.push('/')
      }
      
      setIsChecking(false)
    }

    checkAuth()
  }, [router, pathname])

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

