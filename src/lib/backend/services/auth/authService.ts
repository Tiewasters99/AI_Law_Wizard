// Service for handling deleted user re-authentication

import { prisma } from "../../prisma";

export interface DeletedUserReauthData {
  oldUser: {
    id: string;
    email: string | null;
    name: string | null;
  };
  account: {
    type: string;
    provider: string;
    providerAccountId: string;
    access_token?: string | null;
    refresh_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
  };
}

/**
 * Handle re-authentication of a deleted user
 * - Modifies the old deleted user's email to free it up
 * - Creates a new user with the original email
 * - Links the OAuth account to the new user
 * - Returns the new user data
 */
export async function handleDeletedUserReauthentication(
  data: DeletedUserReauthData
) {
  const { oldUser, account } = data;

  if (!oldUser.email) {
    throw new Error("Old user email is required");
  }

  const normalizedEmail = oldUser.email.toLowerCase().trim();
  const timestamp = Date.now();
  const deletedEmail = `deleted_${timestamp}_${normalizedEmail}`;

  // Use transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Modify old user's email to free it up
    await tx.user.update({
      where: { id: oldUser.id },
      data: {
        email: deletedEmail,
        updatedAt: new Date(),
      },
    });

    // 2. Create new user with original email
    const newUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: oldUser.name,
        role: null, // User will select role on role-selection page
        profileComplete: false,
        emailVerified: null,
        image: null,
        password: null, // OAuth users don't have passwords
      },
    });

    // 3. Link OAuth account to new user
    await tx.account.create({
      data: {
        userId: newUser.id,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
        deletedAt: null, // New account is not deleted
      },
    });

    // 4. Ensure wallet exists for new user
    try {
      const existingWallet = await tx.wallet.findUnique({
        where: { userId: newUser.id },
      });
      if (!existingWallet) {
        await tx.wallet.create({
          data: { userId: newUser.id, balance: 5000 },
        });
      }
    } catch (walletError) {
      console.error("Error ensuring wallet exists:", walletError);
      // Don't fail if wallet creation fails
    }

    return newUser;
  });
}

