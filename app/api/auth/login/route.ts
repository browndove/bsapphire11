import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
const bcrypt = require('bcrypt')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
})

// Simple JWT-like token generation (in production, use proper JWT)
function generateToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // Query the admin_users table
    const query = `
      SELECT id, email, name, password_hash, role, is_active 
      FROM admin_users 
      WHERE email = $1 AND is_active = true
    `
    
    const result = await pool.query(query, [email.toLowerCase()])

    if (result.rows.length === 0) {
      console.log('User not found or inactive:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result.rows[0]
    console.log('User found:', { id: user.id, email: user.email, name: user.name })

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    const token = generateToken(user.id.toString())

    console.log('Login successful for user:', email)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
