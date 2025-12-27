import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return success response with user data (without password)
    return NextResponse.json(
      {
        message: 'Sign in successful',
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Signin error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

