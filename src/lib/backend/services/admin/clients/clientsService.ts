// Service for admin clients business logic

import {
  findAllClients,
  findClientById,
  updateClient,
  updateCustomerProfile,
  deleteClient,
} from "../../../repositories/admin/clients/clientsRepository";
import { ValidationError, NotFoundError } from "../../../utils/errors";

export interface ClientsListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | "name"
    | "email"
    | "company"
    | "createdAt"
    | "tokenBalance"
    | "totalSpent"
    | "purchaseCount";
  sortOrder?: "asc" | "desc";
}

export interface ClientsListResult {
  clients: Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    industry: string | null;
    location: string | null;
    bio: string | null;
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
 * Get list of all clients with pagination
 */
export async function listClients(
  params: ClientsListParams = {}
): Promise<ClientsListResult> {
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

  const { clients, total } = await findAllClients(
    page,
    limit,
    search,
    sortBy,
    sortOrder
  );

  const totalPages = Math.ceil(total / limit);

  return {
    clients,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get client by ID
 */
export async function getClient(id: string) {
  if (!id) {
    throw new ValidationError("Client ID is required");
  }

  const client = await findClientById(id);
  if (!client) {
    throw new NotFoundError("Client");
  }

  return client;
}

/**
 * Update client
 */
export async function updateClientDetails(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    location?: string;
    bio?: string;
    companyName?: string;
    address?: string;
    needs?: string;
  }
) {
  if (!id) {
    throw new ValidationError("Client ID is required");
  }

  // Check if client exists
  const existing = await findClientById(id);
  if (!existing) {
    throw new NotFoundError("Client");
  }

  // Separate user and customer profile data
  // User model fields: name, email, phone, company, industry, location, bio
  // CustomerProfile fields: companyName, address, needs
  const { companyName, address, needs, ...userData } = data;

  // Build user update data - only include fields that are explicitly provided
  const userUpdateData: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    industry?: string | null;
    location?: string | null;
    bio?: string | null;
  } = {};

  // Only add fields that are explicitly provided (including null values)
  if ("name" in data) userUpdateData.name = userData.name ?? null;
  if ("email" in data) userUpdateData.email = userData.email ?? null;
  if ("phone" in data) userUpdateData.phone = userData.phone ?? null;
  if ("company" in data) userUpdateData.company = userData.company ?? null;
  if ("industry" in data) userUpdateData.industry = userData.industry ?? null;
  if ("location" in data) userUpdateData.location = userData.location ?? null;
  if ("bio" in data) userUpdateData.bio = userData.bio ?? null;

  // Update user model
  await updateClient(id, userUpdateData);

  // Update customer profile only if profile-specific fields are provided
  if (companyName !== undefined || address !== undefined || needs !== undefined) {
    const profileUpdateData: {
      companyName?: string;
      address?: string;
      needs?: string;
    } = {};

    // Convert null to undefined to match repository function signature
    if (companyName !== undefined) {
      profileUpdateData.companyName = companyName === null ? undefined : companyName;
    }
    if (address !== undefined) {
      profileUpdateData.address = address === null ? undefined : address;
    }
    if (needs !== undefined) {
      profileUpdateData.needs = needs === null ? undefined : needs;
    }

    await updateCustomerProfile(id, profileUpdateData);
  }

  return await findClientById(id);
}

/**
 * Delete client (soft delete)
 */
export async function deleteClientById(id: string) {
  if (!id) {
    throw new ValidationError("Client ID is required");
  }

  const existing = await findClientById(id);
  if (!existing) {
    throw new NotFoundError("Client");
  }

  await deleteClient(id);
  return { success: true };
}
