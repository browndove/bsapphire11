import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
})

function validateToken(token: string): { userId: string; timestamp: number; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Check if token is expired
    if (payload.exp && Date.now() > payload.exp) {
      return null
    }
    
    return payload
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const payload = validateToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Verify user still exists and is active
    const query = `
      SELECT id, email, name, role, is_active 
      FROM admin_users 
      WHERE id = $1 AND is_active = true
    `
    
    const result = await pool.query(query, [payload.userId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
