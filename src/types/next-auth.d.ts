import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

// Role types
export type UserRole = 'ATTORNEY' | 'CUSTOMER';
export type PrismaRole = 'ATTORNEY' | 'LAWYER' | 'CUSTOMER'; // Include LAWYER for backward compatibility

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: PrismaRole; // Can be ATTORNEY, LAWYER (legacy), or CUSTOMER
      profileComplete: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: PrismaRole; // Can be ATTORNEY, LAWYER (legacy), or CUSTOMER
    profileComplete: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: PrismaRole; // Can be ATTORNEY, LAWYER (legacy), or CUSTOMER
    profileComplete: boolean;
  }
}
