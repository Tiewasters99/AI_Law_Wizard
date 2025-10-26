import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "CUSTOMER" && role !== "ATTORNEY") {
      return NextResponse.json(
        { error: "Invalid role. Must be CUSTOMER or ATTORNEY" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        profileComplete: true,
      },
    });

    // Create wallet with starter tokens
    try {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          tokens: 5000,
        },
      });
    } catch (walletError) {
      console.error("Error creating wallet:", walletError);
      // Don't fail registration if wallet creation fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
