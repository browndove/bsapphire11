"use client"

import { useAuth } from '@/app/context/AuthContext'
import ShadcnLoginForm from '@/components/Auth/ShadcnLoginForm'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-light">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login form directly if not authenticated
  if (!user) {
    return <ShadcnLoginForm />
  }

  // Render protected content if authenticated
  return <>{children}</>
}
