import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession, type User } from '@/lib/auth'

export function useAuth(requireAuth: boolean = false) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    setUser(session)
    setLoading(false)

    // Redirect to signin if auth is required but user is not logged in
    if (requireAuth && !session) {
      router.push('/signin')
    }
  }, [requireAuth, router])

  const logout = () => {
    clearSession()
    setUser(null)
    router.push('/signin')
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}

