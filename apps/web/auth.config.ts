import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, getDbInstance } from "@/db";
import { users, usersProfiles } from "@/db/schema";
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
        // Fetch persona and role from users_profiles if user exists
        if (user.id) {
          const [profile] = await db
            .select()
            .from(usersProfiles)
            .where(eq(usersProfiles.userId, user.id))
            .limit(1);
          if (profile) {
            token.persona = profile.persona;
            token.role = profile.role || null;
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
      // Ensure user profile exists (adapter creates user in users table, but we need to create profile)
      if (user.id) {
        const [existingProfile] = await db
          .select()
          .from(usersProfiles)
          .where(eq(usersProfiles.userId, user.id))
          .limit(1);

        // If profile doesn't exist, create it with defaults
        if (!existingProfile) {
          await db.insert(usersProfiles).values({
            userId: user.id,
            persona: "student",
            role: null,
            minor: false,
            guardianId: null,
            onboardingCompleted: false,
            primaryColor: null,
            secondaryColor: null,
          });
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
