"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication...')
      const token = localStorage.getItem('auth_token')
      
      console.log('AuthContext: Token exists:', !!token)
      
      if (token) {
        try {
          // First try to use stored user data if available
          const userData = localStorage.getItem('user_data')
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData)
              console.log('AuthContext: Using stored user data:', parsedUser)
              setUser(parsedUser)
              setIsLoading(false)
              return
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError)
            }
          }

          // If no stored user data, validate token with backend
          console.log('AuthContext: Validating token with backend...')
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            console.log('AuthContext: Token valid, setting user:', data.user)
            setUser(data.user)
            localStorage.setItem('user_data', JSON.stringify(data.user))
          } else {
            console.log('AuthContext: Token invalid, clearing auth data')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
          }
        } catch (error) {
          console.error('Error validating token:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        }
      }
      
      console.log('AuthContext: Setting isLoading to false')
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Starting login request...')
      console.log('AuthContext: Email:', email)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      console.log('AuthContext: Response status:', response.status)
      console.log('AuthContext: Response ok:', response.ok)

      const data = await response.json()
      console.log('AuthContext: Response data:', data)

      if (response.ok && data.success) {
        console.log('AuthContext: Login successful, storing user data...')
        
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        }

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(userData))
        setUser(userData)
        
        console.log('AuthContext: User data stored, returning true')
        return true
      } else {
        console.error('AuthContext: Login failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
    router.push('/auth/signin')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
