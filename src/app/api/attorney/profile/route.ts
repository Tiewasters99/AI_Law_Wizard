import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is attorney
    const isAttorney =
      session.user.role === "ATTORNEY" || session.user.role === "LAWYER";
    if (!isAttorney) {
      return NextResponse.json(
        { error: "Attorney access required" },
        { status: 403 }
      );
    }

    // Fetch user with profile data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        lawyerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format response data
    const profileData = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      role: user.role,
      profileComplete: user.profileComplete,
      // Attorney-specific profile data
      specialty: user.lawyerProfile?.specialty || "",
      barLicense: user.lawyerProfile?.barLicense || "",
      bio: user.lawyerProfile?.bio || "",
      yearsOfExperience: user.lawyerProfile?.yearsOfExperience || 0,
      firmName: user.lawyerProfile?.firmName || "",
      verified: user.lawyerProfile?.verified || false,
      // Additional fields that might be in profileData JSON
      phone: user.profileData?.phone || "",
      address: user.profileData?.address || "",
      website: user.profileData?.website || "",
    };

    return NextResponse.json({ profile: profileData });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is attorney
    const isAttorney =
      session.user.role === "ATTORNEY" || session.user.role === "LAWYER";
    if (!isAttorney) {
      return NextResponse.json(
        { error: "Attorney access required" },
        { status: 403 }
      );
    }

    const {
      name,
      email,
      phone,
      address,
      website,
      specialty,
      barLicense,
      bio,
      yearsOfExperience,
      firmName,
    } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
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

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already taken" },
        { status: 409 }
      );
    }

    // Update user and profile in a transaction
    const result = await prisma.$transaction(async tx => {
      // Update basic user data
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          name,
          email,
          profileData: {
            phone: phone || "",
            address: address || "",
            website: website || "",
          },
          profileComplete: true,
        },
      });

      // Update or create lawyer profile
      const lawyerProfile = await tx.lawyerProfile.upsert({
        where: { userId: session.user.id },
        update: {
          specialty: specialty || "",
          barLicense: barLicense || "",
          bio: bio || "",
          yearsOfExperience: yearsOfExperience
            ? parseInt(yearsOfExperience)
            : 0,
          firmName: firmName || "",
        },
        create: {
          userId: session.user.id,
          specialty: specialty || "",
          barLicense: barLicense || "",
          bio: bio || "",
          yearsOfExperience: yearsOfExperience
            ? parseInt(yearsOfExperience)
            : 0,
          firmName: firmName || "",
        },
      });

      return { user: updatedUser, lawyerProfile };
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        image: result.user.image,
        role: result.user.role,
        profileComplete: result.user.profileComplete,
        specialty: result.lawyerProfile.specialty,
        barLicense: result.lawyerProfile.barLicense,
        bio: result.lawyerProfile.bio,
        yearsOfExperience: result.lawyerProfile.yearsOfExperience,
        firmName: result.lawyerProfile.firmName,
        verified: result.lawyerProfile.verified,
        phone: result.user.profileData?.phone || "",
        address: result.user.profileData?.address || "",
        website: result.user.profileData?.website || "",
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
