import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { handleDeletedUserReauthentication } from "./services/auth/authService";

// Validate required environment variables
function validateEnvVars() {
  const required = [
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Validate on module load (only in production or when explicitly enabled)
if (
  process.env.NODE_ENV === "production" ||
  process.env.VALIDATE_ENV === "true"
) {
  try {
    validateEnvVars();
  } catch (error) {
    console.error("Environment validation failed:", error);
  }
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function for wallet creation
async function ensureWallet(userId: string) {
  try {
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (!existingWallet) {
      await prisma.wallet.create({
        data: { userId, balance: 5000 },
      });
      console.log(`Created wallet with 5000 tokens for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error ensuring wallet exists:", error);
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Enable linking for existing users
      // Normalize email from Google OAuth
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email
            ? profile.email.toLowerCase().trim()
            : profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            console.error("Authentication error: Missing credentials", {
              hasEmail: !!credentials?.email,
              hasPassword: !!credentials?.password,
            });
            return null;
          }

          // Normalize email to lowercase and trim whitespace
          const normalizedEmail = credentials.email.toLowerCase().trim();

          // Validate email format
          if (!isValidEmail(normalizedEmail)) {
            console.error("Authentication error: Invalid email format", {
              email: normalizedEmail,
            });
            return null;
          }

          // Find user by normalized email
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            console.error("Authentication error: User not found", {
              email: normalizedEmail,
            });
            return null;
          }

          // Check if user is deleted
          if (user.deletedAt) {
            console.error(
              "Authentication error: User account has been deleted",
              {
                userId: user.id,
                email: normalizedEmail,
                deletedAt: user.deletedAt,
              }
            );
            return null;
          }

          if (!user.password) {
            console.error("Authentication error: User has no password", {
              userId: user.id,
              email: normalizedEmail,
            });
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error("Authentication error: Invalid password", {
              userId: user.id,
              email: normalizedEmail,
            });
            return null;
          }

          // Return user with role (can be null)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as "ATTORNEY" | "CUSTOMER" | null,
            profileComplete: user.profileComplete,
          };
        } catch (error) {
          console.error("Credentials provider error:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            console.error("Admin authentication error: Missing credentials", {
              hasEmail: !!credentials?.email,
              hasPassword: !!credentials?.password,
            });
            return null;
          }

          // Normalize email to lowercase and trim whitespace
          const normalizedEmail = credentials.email.toLowerCase().trim();

          // Validate email format
          if (!isValidEmail(normalizedEmail)) {
            console.error("Admin authentication error: Invalid email format", {
              email: normalizedEmail,
            });
            return null;
          }

          // Query Admin table (not User table)
          const admin = await prisma.admin.findUnique({
            where: { email: normalizedEmail },
          });

          if (!admin) {
            console.error("Admin authentication error: Admin not found", {
              email: normalizedEmail,
            });
            return null;
          }

          if (!admin.isActive) {
            console.error(
              "Admin authentication error: Admin account inactive",
              {
                adminId: admin.id,
                email: normalizedEmail,
              }
            );
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
            console.error("Admin authentication error: Invalid password", {
              adminId: admin.id,
              email: normalizedEmail,
            });
            return null;
          }

          // Update last login info
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              lastLoginAt: new Date(),
            },
          });

          // Log login action
          await prisma.adminActivityLog.create({
            data: {
              adminId: admin.id,
              action: "LOGIN",
              ipAddress: "127.0.0.1", // This should be passed from request context
              userAgent: "Admin Portal", // This should be passed from request context
            },
          });

          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            image: admin.image,
            isAdmin: true,
            isSuperAdmin: admin.isSuperAdmin,
          };
        } catch (error) {
          console.error("Admin auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Handle OAuth sign-in (Google and future providers)
        if (account?.provider === "google") {
          if (!user.email) {
            console.error("OAuth error: No email provided by Google");
            return false;
          }

          // Normalize email to lowercase
          const normalizedEmail = user.email.toLowerCase().trim();

          // Check if user exists with this email (including deleted users)
          const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
              accounts: {
                where: { deletedAt: null }, // Only include non-deleted accounts
              },
            },
          });

          if (!existingUser) {
            // User doesn't exist - allow adapter to create user
            // We'll set role to null in jwt callback after user is created
            console.log(
              `Creating new user via Google OAuth: ${normalizedEmail}`
            );
            return true;
          }

          // Check if user is deleted
          if (existingUser.deletedAt) {
            // User was deleted - create new account instead of reusing old one
            console.log(
              `Deleted user attempting to sign in: ${normalizedEmail}. Creating new account.`
            );
            try {
              await handleDeletedUserReauthentication({
                oldUser: {
                  id: existingUser.id,
                  email: existingUser.email,
                  name: existingUser.name,
                },
                account: {
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
                },
              });
              console.log(
                `Created new account for previously deleted user: ${normalizedEmail}`
              );
              // Return true to allow sign-in with new account
              return true;
            } catch (error) {
              console.error(
                "Error handling deleted user re-authentication:",
                error
              );
              return false;
            }
          }

          // User exists and is not deleted - link Google account if not already linked
          // Check for non-deleted Google accounts only
          const hasGoogleAccount = existingUser.accounts.some(
            acc => acc.provider === "google" && acc.deletedAt === null
          );

          if (!hasGoogleAccount) {
            try {
              // Link Google account to existing user (automatic linking by email)
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
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
              console.log(
                `Linked Google OAuth account to existing user: ${existingUser.email}`
              );
            } catch (linkError) {
              console.error("Error linking Google account:", linkError);
              // Continue with sign-in even if linking fails
            }
          } else {
            console.log(
              `Google account already linked for user: ${existingUser.email}`
            );
          }

          // Ensure wallet exists
          try {
            await ensureWallet(existingUser.id);
          } catch (walletError) {
            console.error("Error ensuring wallet exists:", walletError);
            // Don't fail sign-in if wallet creation fails
          }
        }
        // Return true to allow sign-in to proceed
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id;
          // Normalize email to lowercase
          token.email = user.email
            ? user.email.toLowerCase().trim()
            : user.email;
          token.role = user.role;
          token.profileComplete = user.profileComplete;
          token.isAdmin = (user as any).isAdmin;
          token.isSuperAdmin = (user as any).isSuperAdmin;

          // For new OAuth users: ensure role is null and wallet exists
          if (user.id && !token.isAdmin) {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                  role: true,
                  email: true,
                },
              });

              if (dbUser) {
                // Normalize email in token
                if (dbUser.email) {
                  token.email = dbUser.email.toLowerCase().trim();
                }

                // For new OAuth users, the role should be null
                // If it's not null (which shouldn't happen, but we'll be safe), use the existing role
                if (dbUser.role !== null && dbUser.role !== undefined) {
                  // User already has a role - use it
                  token.role = dbUser.role as "ATTORNEY" | "CUSTOMER" | null;
                } else {
                  // Role is null (correct for new OAuth users) - set token role to null
                  token.role = null;
                }
              }

              // Ensure wallet exists for new OAuth sign-ins
              await ensureWallet(user.id);
            } catch (error) {
              console.error("Error handling new OAuth user:", error);
              // Don't fail JWT creation if wallet/user update fails
            }
          }
        }

        // Update user data from database on each request to ensure fresh data
        // Use token.id to ensure we fetch the correct user associated with this session
        if (token.id && !user) {
          // Only fetch on subsequent requests (not during initial sign-in when user object exists)
          try {
            // Check if this is an admin user
            if (token.isAdmin) {
              const dbAdmin = await prisma.admin.findUnique({
                where: { id: token.id as string },
                select: {
                  isActive: true,
                  isSuperAdmin: true,
                },
              });
              if (dbAdmin && dbAdmin.isActive) {
                token.isSuperAdmin = dbAdmin.isSuperAdmin;
              } else {
                // Admin is no longer active
                token.isAdmin = false;
                token.isSuperAdmin = false;
              }
            } else {
              // Regular user - fetch fresh role from database using user ID
              const dbUser = await prisma.user.findUnique({
                where: { id: token.id as string },
                select: {
                  role: true,
                  profileComplete: true,
                  email: true,
                },
              });
              if (dbUser) {
                // Normalize and update email if not already set
                if (dbUser.email) {
                  token.email = dbUser.email.toLowerCase().trim();
                } else if (!token.email) {
                  token.email = dbUser.email;
                }
                // Role can be null - don't default to CUSTOMER
                token.role = dbUser.role as "ATTORNEY" | "CUSTOMER" | null;
                token.profileComplete = dbUser.profileComplete;
              }
            }
          } catch (error) {
            console.error("Error updating token from database:", error);
            // Don't fail JWT creation if database fetch fails
          }
        }

        return token;
      } catch (error) {
        console.error("Error in JWT callback:", error);
        // Return token even if there's an error to prevent auth failures
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ATTORNEY" | "CUSTOMER" | null;
        session.user.profileComplete = token.profileComplete as boolean;
        (session as any).isAdmin = token.isAdmin as boolean;
        (session as any).isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle error redirects - redirect to login page with error parameter
      if (url.includes("/api/auth/error") || url.includes("error=")) {
        // Extract error parameter if present
        try {
          const urlObj = new URL(url, baseUrl);
          const errorParam = urlObj.searchParams.get("error");
          if (errorParam) {
            return `${baseUrl}/auth/login?error=${errorParam}`;
          }
        } catch {
          // If URL parsing fails, just redirect to login
        }
        return `${baseUrl}/auth/login`;
      }

      // Handle OAuth callback URLs
      // After OAuth callback, NextAuth creates session and then redirects
      // The middleware will handle role-based redirects:
      // - Users with null role → /auth/role-selection
      // - Users with ATTORNEY role → /attorney/dashboard
      // - Users with CUSTOMER role → /client/dashboard
      const isCallback = url.includes("/api/auth/callback/");
      if (isCallback) {
        // Redirect to role-selection initially - middleware will redirect if user has role
        return `${baseUrl}/auth/role-selection`;
      }

      // Allow role-selection page access
      if (url.includes("/auth/role-selection")) {
        return url;
      }

      // If redirecting to a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // If redirecting to same origin, allow it
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL, use baseUrl
      }

      // Default to base URL (middleware will handle role-based redirect)
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login", // Redirect errors to login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
