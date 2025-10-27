import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/db/userService';
import { insertUserSchema } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input data
    const validation = insertUserSchema.safeParse({ email, password });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await UserService.createUser({ email, password });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
