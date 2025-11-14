// Service for user registration

import {
  findUserByEmail,
  createUser,
} from "@/lib/backend/repositories/common/userRepository";
import {
  createWalletWithStarterTokens,
} from "@/lib/backend/repositories/purchase/walletRepository";
import {
  validateRequired,
  validateEmail,
  validateEnum,
  validateNonEmptyString,
} from "@/lib/backend/utils/validation";
import { ConflictError, ValidationError } from "@/lib/backend/utils/errors";
import bcrypt from "bcryptjs";

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role: "CUSTOMER" | "ATTORNEY";
}

export interface RegisteredUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Register a new user
 */
export async function registerUser(
  data: RegistrationData
): Promise<RegisteredUser> {
  // Validate required fields
  const email = validateRequired(data.email, "Email");
  const password = validateRequired(data.password, "Password");
  const name = validateRequired(data.name, "Name");
  const role = validateRequired(data.role, "Role");

  // Validate email format
  validateEmail(email, "Email");

  // Validate password strength
  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long");
  }

  // Validate name is not empty
  validateNonEmptyString(name, "Name");

  // Validate role
  const validRole = validateEnum(role, ["CUSTOMER", "ATTORNEY"], "Role");

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await createUser({
    email,
    password: hashedPassword,
    name: name.trim(),
    role: validRole,
  });

  // Create wallet with starter tokens (non-blocking - don't fail registration if this errors)
  try {
    await createWalletWithStarterTokens(user.id, 5000);
  } catch (walletError) {
    console.error("Error creating wallet:", walletError);
    // Don't fail registration if wallet creation fails
  }

  return {
    id: user.id,
    email: user.email || email,
    name: user.name,
    role: user.role,
  };
}

