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
  sortBy?: "name" | "email" | "company" | "createdAt" | "tokenBalance" | "totalSpent" | "purchaseCount";
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

  const { clients, total } = await findAllClients(page, limit, search, sortBy, sortOrder);

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

  // Separate user and profile data
  const {
    companyName,
    address,
    needs,
    ...userData
  } = data;

  // Update user
  await updateClient(id, userData);

  // Update customer profile if profile data provided
  if (companyName !== undefined || address !== undefined || needs !== undefined || data.industry !== undefined || data.phone !== undefined) {
    await updateCustomerProfile(id, {
      companyName: companyName || data.company,
      address,
      industry: data.industry,
      phone: data.phone,
      needs,
    });
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

