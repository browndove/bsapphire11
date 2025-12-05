"use client"

import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ShadcnLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Login form: Starting login process...')
      console.log('Login form: Email:', formData.email)
      console.log('Login form: Password length:', formData.password.length)
      
      // Direct API call to bypass AuthContext temporarily
      console.log('Login form: Making direct API call...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('Login form: Request timeout, aborting...')
        controller.abort()
      }, 5000) // 5 second timeout
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      console.log('Login form: Fetch completed successfully')

      console.log('Login form: Response received, status:', response.status)
      
      const data = await response.json()
      console.log('Login form: Response data:', data)
      
      if (response.ok && data.success) {
        console.log('Login form: Login successful!')
        toast.success('Welcome back!')
        
        // Store auth data manually
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        console.log('Login form: Auth data stored, redirecting...')
        
        // Force navigation to dashboard
        window.location.href = '/dashboard'
      } else {
        console.log('Login form: Login failed:', data.error)
        toast.error(data.error || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Login form: Error during login:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      console.log('Login form: Setting loading to false')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@bsapphire.com',
      password: 'admin123',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light tracking-wide text-slate-800 dark:text-slate-200">
            Welcome Back
          </h1>
          <p className="text-sm font-light text-slate-500 dark:text-slate-400">
            {pathname === '/dashboard' 
              ? 'Please sign in to access the dashboard' 
              : 'Please sign in to continue'}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-lg font-medium text-center text-slate-700 dark:text-slate-300">
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Demo Credentials Banner */}
            <div className="mb-6 p-3 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Demo Access
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    admin@bsapphire.com
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fillDemoCredentials}
                  className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-600/30 h-7 px-2"
                >
                  Fill
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-0 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-0 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white border-0 shadow-sm h-10 text-sm font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Authorized access only
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 BSapphire
          </p>
        </div>
      </div>
    </div>
  )
}
