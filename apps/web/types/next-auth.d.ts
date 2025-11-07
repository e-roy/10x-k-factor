import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      persona?: string;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    persona?: string;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    persona?: string;
    role?: string | null;
  }
}
