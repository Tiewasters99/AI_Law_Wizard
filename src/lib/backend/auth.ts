import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Validate role if provided
        if (credentials.role && user.role !== credentials.role) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role || "CUSTOMER") as "ATTORNEY" | "CUSTOMER",
          profileComplete: user.profileComplete,
        };
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
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          // Query Admin table (not User table)
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });

          if (!admin || !admin.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
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
      // Handle OAuth sign-in (Google and future providers)
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { lawyerProfile: true, customerProfile: true },
          });

          if (!existingUser) {
            // Create new OAuth user
            const newUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: new Date(),
                role: "CUSTOMER",
                profileComplete: true,
                accounts: {
                  create: {
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
                },
              },
            });

            // Create wallet with starter tokens for new OAuth users
            try {
              await prisma.wallet.create({
                data: {
                  userId: newUser.id,
                  balance: 5000,
                },
              });
              console.log(
                `Created wallet with 5000 tokens for OAuth user: ${newUser.email}`
              );
            } catch (walletError) {
              console.error(
                "Error creating wallet for OAuth user:",
                walletError
              );
            }
          } else {
            // Ensure existing users have a wallet
            try {
              const existingWallet = await prisma.wallet.findUnique({
                where: { userId: existingUser.id },
              });

              if (!existingWallet) {
                await prisma.wallet.create({
                  data: {
                    userId: existingUser.id,
                    balance: 5000,
                  },
                });
                console.log(
                  `Created wallet with 5000 tokens for user without wallet: ${existingUser.email}`
                );
              }
            } catch (walletError) {
              console.error("Error ensuring wallet exists:", walletError);
            }
          }
        } catch (error) {
          console.error("Error during OAuth sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileComplete = user.profileComplete;
        token.isAdmin = (user as any).isAdmin;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      }

      // Update user data from database on each request to ensure fresh data
      if (token.email) {
        try {
          // Check if this is an admin user
          if (token.isAdmin) {
            const dbAdmin = await prisma.admin.findUnique({
              where: { email: token.email as string },
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
            // Regular user
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email as string },
              select: {
                role: true,
                profileComplete: true,
              },
            });
            if (dbUser) {
              token.role = (dbUser.role || "CUSTOMER") as
                | "ATTORNEY"
                | "CUSTOMER";
              token.profileComplete = dbUser.profileComplete;
            }
          }
        } catch (error) {
          console.error("Error updating token from database:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ATTORNEY" | "CUSTOMER";
        session.user.profileComplete = token.profileComplete as boolean;
        (session as any).isAdmin = token.isAdmin as boolean;
        (session as any).isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
