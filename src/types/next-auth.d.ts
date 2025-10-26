import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

export type UserRole = "ATTORNEY" | "CUSTOMER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      profileComplete: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    profileComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    profileComplete: boolean;
  }
}
