"use client"

import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)
      
      if (success) {
        toast.success('Login successful!')
        router.push('/dashboard')
      } else {
        toast.error('Invalid credentials. Please try again.')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section className="pb-12.5 pt-32.5 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="relative z-1 mx-auto max-w-c-1016 px-7.5 pb-7.5 pt-10 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
        <div className="absolute left-0 top-0 -z-1 h-2/3 w-full rounded-lg bg-gradient-to-t from-transparent to-[#dee7ff47] dark:bg-gradient-to-t dark:to-[#252A42]"></div>
        <div className="absolute bottom-17.5 left-0 -z-1 h-1/3 w-full">
          <Image
            src="/images/shape/shape-dotted-light.svg"
            alt="Dotted"
            className="dark:hidden"
            fill
          />
          <Image
            src="/images/shape/shape-dotted-dark.svg"
            alt="Dotted"
            className="hidden dark:block"
            fill
          />
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: -20 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: true }}
          className="animate_top rounded-lg bg-white px-7.5 pt-7.5 shadow-solid-8 dark:border dark:border-strokedark dark:bg-black xl:px-15 xl:pt-15"
        >
          <h2 className="mb-15 text-center text-3xl font-semibold text-black dark:text-white xl:text-sectiontitle2">
            Admin Login
          </h2>

          <div className="mb-8 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Demo Credentials
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                Email: <span className="font-mono">admin@bsapphire.com</span>
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Password: <span className="font-mono">admin123</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5 lg:gap-12.5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent px-6 py-3 text-black outline-none transition-all duration-300 focus:border-primary dark:border-strokedark dark:bg-[#2C303B] dark:text-white dark:focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent px-6 py-3 text-black outline-none transition-all duration-300 focus:border-primary dark:border-strokedark dark:bg-[#2C303B] dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-white transition-all duration-300 hover:bg-primaryho disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                This is an admin-only area for managing candidate applications.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
