import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, getDbInstance } from "@/db";
import { users } from "@/db/schema";
import { accounts, sessions, verificationTokens } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

// Lazy adapter initialization to avoid build-time DATABASE_URL requirement
function getAdapter() {
  // Only initialize if DATABASE_URL is available (runtime)
  if (!process.env.DATABASE_URL) {
    return undefined;
  }
  return DrizzleAdapter(getDbInstance(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });
}

// Ensure AUTH_SECRET is available
const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV !== "test") {
  console.warn(
    "⚠️  AUTH_SECRET is missing. Please set AUTH_SECRET or NEXTAUTH_SECRET in your .env.local file"
  );
}

export const authConfig = {
  secret,
  trustHost: true, // Allow NextAuth to work with any host (useful for development)
  adapter: getAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts by email
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account: _account }) {
      if (user) {
        token.id = user.id;
        // Fetch persona and role from database if user exists
        if (user.id) {
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);
          if (dbUser) {
            token.persona = dbUser.persona;
            token.role = dbUser.role || null;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.persona = (token.persona as string) || "student";
        session.user.role = (token.role as string) || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If url is a relative path, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to /app
      return `${baseUrl}/app`;
    },
    async signIn({ user, account: _account, profile: _profile }) {
      // Ensure persona is set for users (adapter creates user, but we ensure persona default)
      if (user.id) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        // If user exists but no persona, set default (adapter should handle this via schema default, but just in case)
        if (existingUser && !existingUser.persona) {
          await db
            .update(users)
            .set({ persona: "student" })
            .where(eq(users.id, user.id));
        }

        // Track invite.joined event if this is a new user with attribution
        // Note: We can't access cookies directly in signIn callback, so we'll track this
        // in a client component or API route that runs after sign-in
        // For now, we'll create an API route that can be called after sign-in
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
