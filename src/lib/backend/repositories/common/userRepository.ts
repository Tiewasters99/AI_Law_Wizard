// Repository for user database operations

import { prisma } from "../../prisma";

export interface UserWithWallet {
  id: string;
  email: string | null;
  name: string | null;
  wallet: {
    id: string;
    userId: string;
    balance: number;
  } | null;
}

/**
 * Find user by email with wallet
 */
export async function findUserByEmailWithWallet(
  email: string
): Promise<UserWithWallet | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    wallet: user.wallet
      ? {
          id: user.wallet.id,
          userId: user.wallet.userId,
          balance: user.wallet.balance,
        }
      : null,
  };
}

/**
 * Find user by ID with wallet
 */
export async function findUserByIdWithWallet(
  userId: string
): Promise<UserWithWallet | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    wallet: user.wallet
      ? {
          id: user.wallet.id,
          userId: user.wallet.userId,
          balance: user.wallet.balance,
        }
      : null,
  };
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: "CUSTOMER" | "ATTORNEY";
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData) {
  return await prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      profileComplete: true,
    },
  });
}

