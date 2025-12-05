"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"

export default function TestButton() {
  const [result, setResult] = useState<string>('')

  const testGet = async () => {
    try {
      console.log('Testing GET /api/test...')
      const response = await fetch('/api/test')
      const data = await response.json()
      console.log('GET response:', data)
      setResult(`GET: ${data.message}`)
    } catch (error) {
      console.error('GET error:', error)
      setResult(`GET Error: ${error}`)
    }
  }

  const testPost = async () => {
    try {
      console.log('Testing POST /api/test...')
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      })
      const data = await response.json()
      console.log('POST response:', data)
      setResult(`POST: ${data.message}`)
    } catch (error) {
      console.error('POST error:', error)
      setResult(`POST Error: ${error}`)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">API Test</h3>
      <div className="space-x-2 mb-2">
        <Button onClick={testGet} size="sm">Test GET</Button>
        <Button onClick={testPost} size="sm">Test POST</Button>
      </div>
      <p className="text-sm">{result}</p>
    </div>
  )
}
