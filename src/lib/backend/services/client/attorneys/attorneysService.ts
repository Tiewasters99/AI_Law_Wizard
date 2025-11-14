// Service for client attorney listing functionality

import { findAttorneysWithProfiles } from "../../../repositories/attorney/lawyerProfileRepository";

export interface AttorneySearchFilters {
  search?: string;
  practiceArea?: string;
  location?: string;
  page?: number;
  limit?: number;
}

/**
 * List attorneys available for clients
 */
export async function listAttorneys(filters: AttorneySearchFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // Get paginated attorneys from database
  const { attorneys, total, hasMore } = await findAttorneysWithProfiles(
    skip,
    limit
  );

  // Apply search filter
  let filtered = attorneys;
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      a =>
        a.name?.toLowerCase().includes(searchLower) ||
        a.lawyerProfile?.bio?.toLowerCase().includes(searchLower) ||
        a.lawyerProfile?.practiceAreas?.some((area: string) =>
          area.toLowerCase().includes(searchLower)
        )
    );
  }

  // Apply practice area filter
  if (filters.practiceArea && filters.practiceArea !== "all") {
    filtered = filtered.filter(a =>
      a.lawyerProfile?.practiceAreas?.includes(filters.practiceArea!)
    );
  }

  // Apply location filter
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filtered = filtered.filter(a =>
      a.lawyerProfile?.location?.toLowerCase().includes(locationLower)
    );
  }

  // Format response
  const formatted = filtered.map(a => ({
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
  formatted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return {
    attorneys: formatted,
    total,
    page,
    limit,
    hasMore: hasMore && filtered.length === limit,
  };
}
