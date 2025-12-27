// Auth utilities for managing user sessions in localStorage

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

const AUTH_STORAGE_KEY = 'tradehub_user'

// Save user session to localStorage
export const saveSession = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }
}

// Get user session from localStorage
export const getSession = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr) as User
      } catch (error) {
        console.error('Error parsing user session:', error)
        return null
      }
    }
  }
  return null
}

// Remove user session from localStorage
export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getSession() !== null
}

// Get user's full name
export const getUserFullName = (): string => {
  const user = getSession()
  if (user) {
    return `${user.firstName} ${user.lastName}`
  }
  return 'User'
}

