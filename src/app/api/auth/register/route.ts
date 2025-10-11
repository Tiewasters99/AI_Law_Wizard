import { PrismaClient, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Import TokenTracker dynamically to avoid SSR issues
const getTokenTracker = async () => {
  const { TokenTracker } = await import('@/app/lib/tokenTracker');
  return TokenTracker;
};

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { message: 'Role is required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'ATTORNEY' && role !== 'CUSTOMER') {
      return NextResponse.json(
        { message: 'Invalid role. Must be ATTORNEY or CUSTOMER' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role, // Set role during registration
        profileComplete: true, // Profile is complete since role is provided
      },
    });

    // Create a wallet for the user
    await prisma.wallet.create({
      data: {
        userId: user.id,
      },
    });

    // Reset tokens - grant 5000 tokens to new registered users
    try {
      const TokenTracker = await getTokenTracker();
      TokenTracker.resetOnSignup(user.id);
    } catch (tokenError) {
      console.error('Error resetting tokens:', tokenError);
      // Don't fail registration if token reset fails
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileComplete: user.profileComplete,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
