import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

export type UserRole = "ATTORNEY" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: UserRole;
      profileComplete: boolean;
    } & DefaultSession["user"];
    // Admin session properties
    adminId?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  }

  interface User extends DefaultUser {
    role?: UserRole;
    profileComplete?: boolean;
    // Admin user properties
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    // User properties
    id?: string;
    role?: UserRole;
    profileComplete?: boolean;
    // Admin properties
    adminId?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  }
}
