import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const adminAuthOptions: AuthOptions = {
  providers: [
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
              // Note: IP address would be passed from the request context
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
    async jwt({ token, user }) {
      if (user) {
        token.adminId = user.id;
        token.isAdmin = true;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.adminId = token.adminId as string;
        session.isAdmin = token.isAdmin as boolean;
        session.isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(adminAuthOptions);

export { handler as GET, handler as POST };
