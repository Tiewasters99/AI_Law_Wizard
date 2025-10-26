import NextAuth from "next-auth";
import { adminAuthOptions } from "@/lib/backend/adminAuth";

const handler = NextAuth(adminAuthOptions);

export const { GET, POST } = handler;
