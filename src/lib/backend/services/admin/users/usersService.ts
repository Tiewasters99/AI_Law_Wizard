// Service for admin-created users

import {
  findUserByEmail,
  createUser,
} from "../../../repositories/common/userRepository";
import { createWalletWithStarterTokens } from "../../../repositories/purchase/walletRepository";
import {
  validateRequired,
  validateEmail,
  validateEnum,
  validateNonEmptyString,
} from "../../../utils/validation";
import { ConflictError, ValidationError } from "../../../utils/errors";
import bcrypt from "bcryptjs";

export interface AdminCreateUserData {
  email: string;
  password: string;
  name: string;
  role: "CUSTOMER" | "ATTORNEY";
  phone?: string;
  company?: string;
}

export interface AdminCreatedUser {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ATTORNEY";
}

/**
 * Admin creates a new user account
 */
export async function createUserAsAdmin(
  data: AdminCreateUserData
): Promise<AdminCreatedUser> {
  const email = validateRequired(data.email, "Email");
  const password = validateRequired(data.password, "Password");
  const name = validateRequired(data.name, "Name");
  const role = validateRequired(data.role, "Role");

  validateEmail(email, "Email");

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long");
  }

  validateNonEmptyString(name, "Name");

  const validRole = validateEnum(role, ["CUSTOMER", "ATTORNEY"], "Role");

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ConflictError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    email,
    password: hashedPassword,
    name: name.trim(),
    role: validRole,
    phone: data.phone,
    company: data.company,
  });

  // Non-blocking wallet creation; failure shouldn't abort user creation
  try {
    await createWalletWithStarterTokens(user.id, 5000);
  } catch (err) {
    console.error("Admin create user: wallet creation failed", err);
  }

  return {
    id: user.id,
    email: user.email || email,
    name: user.name,
    role: user.role as "CUSTOMER" | "ATTORNEY",
  };
}

