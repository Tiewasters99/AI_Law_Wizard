import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const practiceArea = searchParams.get("practiceArea");
    const location = searchParams.get("location");

    // Build where clause
    const where: any = {
      role: "ATTORNEY",
      profileComplete: true, // Only show attorneys with complete profiles
    };

    // Fetch attorneys with their lawyer profiles
    const attorneys = await prisma.user.findMany({
      where,
      include: {
        lawyerProfile: true,
      },
    });

    // Filter and format attorneys
    let filteredAttorneys = attorneys.filter(a => a.lawyerProfile);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAttorneys = filteredAttorneys.filter(
        a =>
          a.name?.toLowerCase().includes(searchLower) ||
          a.lawyerProfile?.bio?.toLowerCase().includes(searchLower) ||
          a.lawyerProfile?.practiceAreas?.some((area: string) =>
            area.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply practice area filter
    if (practiceArea && practiceArea !== "all") {
      filteredAttorneys = filteredAttorneys.filter(a =>
        a.lawyerProfile?.practiceAreas?.includes(practiceArea)
      );
    }

    // Apply location filter
    if (location) {
      const locationLower = location.toLowerCase();
      filteredAttorneys = filteredAttorneys.filter(a =>
        a.lawyerProfile?.location?.toLowerCase().includes(locationLower)
      );
    }

    // Format response
    const formattedAttorneys = filteredAttorneys.map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      image: a.image,
      bio: a.lawyerProfile?.bio || null,
      practiceAreas: a.lawyerProfile?.practiceAreas || [],
      yearsOfExperience: a.lawyerProfile?.yearsOfExperience || null,
      location: a.lawyerProfile?.location || null,
      barNumber: a.lawyerProfile?.barNumber || null,
      rating: a.lawyerProfile?.rating || null,
      casesHandled: a.lawyerProfile?.casesHandled || null,
      availability: a.lawyerProfile?.availability || null,
      hourlyRate: a.lawyerProfile?.hourlyRate || null,
    }));

    // Sort by rating
    formattedAttorneys.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return NextResponse.json({
      attorneys: formattedAttorneys,
      total: formattedAttorneys.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching attorneys:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch attorneys",
        attorneys: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
