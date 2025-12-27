import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const { firstName, lastName, email, password, confirmPassword } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    // Return success response (don't send password back)
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

