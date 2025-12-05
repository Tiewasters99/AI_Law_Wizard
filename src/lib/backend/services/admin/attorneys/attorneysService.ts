// Service for admin attorneys business logic

import {
  findAllAttorneys,
  findAttorneyById,
  updateAttorney,
  updateLawyerProfile,
  deleteAttorney,
} from "../../../repositories/admin/attorneys/attorneysRepository";
import { ValidationError, NotFoundError } from "../../../utils/errors";

export interface AttorneysListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | "name"
    | "email"
    | "firmName"
    | "specialty"
    | "createdAt"
    | "tokenBalance"
    | "totalSpent"
    | "purchaseCount";
  sortOrder?: "asc" | "desc";
}

export interface AttorneysListResult {
  attorneys: Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    specialty: string | null;
    firmName: string | null;
    location: string | null;
    createdAt: Date;
    tokenBalance: number;
    purchaseCount: number;
    totalSpent: number;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get list of all attorneys with pagination
 */
export async function listAttorneys(
  params: AttorneysListParams = {}
): Promise<AttorneysListResult> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const search = params.search?.trim();

  // Validate pagination parameters
  if (page < 1) {
    throw new ValidationError("Page must be greater than 0");
  }

  if (limit < 1 || limit > 100) {
    throw new ValidationError("Limit must be between 1 and 100");
  }

  const sortBy = params.sortBy;
  const sortOrder = params.sortOrder || "desc";

  const { attorneys, total } = await findAllAttorneys(
    page,
    limit,
    search,
    sortBy,
    sortOrder
  );

  const totalPages = Math.ceil(total / limit);

  return {
    attorneys,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get attorney by ID
 */
export async function getAttorney(id: string) {
  if (!id) {
    throw new ValidationError("Attorney ID is required");
  }

  const attorney = await findAttorneyById(id);
  if (!attorney) {
    throw new NotFoundError("Attorney");
  }

  return attorney;
}

/**
 * Update attorney
 */
export async function updateAttorneyDetails(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    location?: string;
    bio?: string;
    specialty?: string;
    firmName?: string;
    barLicense?: string;
    barNumber?: string;
    yearsOfExperience?: number;
    hourlyRate?: number;
    practiceAreas?: string[];
  }
) {
  if (!id) {
    throw new ValidationError("Attorney ID is required");
  }

  // Check if attorney exists
  const existing = await findAttorneyById(id);
  if (!existing) {
    throw new NotFoundError("Attorney");
  }

  // Separate user and profile data
  const {
    specialty,
    firmName,
    barLicense,
    barNumber,
    yearsOfExperience,
    hourlyRate,
    practiceAreas,
    ...userData
  } = data;

  // Update user
  await updateAttorney(id, userData);

  // Update lawyer profile if profile data provided
  if (
    specialty !== undefined ||
    firmName !== undefined ||
    barLicense !== undefined ||
    barNumber !== undefined ||
    yearsOfExperience !== undefined ||
    hourlyRate !== undefined ||
    practiceAreas !== undefined ||
    data.location !== undefined ||
    data.bio !== undefined
  ) {
    await updateLawyerProfile(id, {
      specialty,
      firmName,
      barLicense,
      barNumber,
      yearsOfExperience,
      location: data.location,
      hourlyRate,
      practiceAreas,
      bio: data.bio,
    });
  }

  return await findAttorneyById(id);
}

/**
 * Delete attorney (soft delete)
 */
export async function deleteAttorneyById(id: string) {
  if (!id) {
    throw new ValidationError("Attorney ID is required");
  }

  const existing = await findAttorneyById(id);
  if (!existing) {
    throw new NotFoundError("Attorney");
  }

  await deleteAttorney(id);
  return { success: true };
}
