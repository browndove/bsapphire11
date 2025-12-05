import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test login API called')
    
    const { email, password } = await request.json()
    
    console.log('Received email:', email)
    console.log('Received password:', password)

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Simple test without database
    if (email === 'admin@bsapphire.com' && password === 'admin123') {
      console.log('Test login successful')
      return NextResponse.json({
        success: true,
        token: 'test-token-123',
        user: {
          id: '1',
          email: 'admin@bsapphire.com',
          name: 'Admin User',
          role: 'admin',
        },
      })
    }

    console.log('Test login failed - invalid credentials')
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
