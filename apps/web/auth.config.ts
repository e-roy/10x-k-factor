import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, getDbInstance } from "@/db";
import { usersProfiles } from "@/db/schema/index";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account: _account }) {
      if (user) {
        token.id = user.id;
        // When a new user signs in, ensure profile exists and fetch role from users table
        if (user.id) {
          try {
            // Fetch user from database to get role
            const [dbUser] = await db
              .select()
              .from(users)
              .where(eq(users.id, user.id))
              .limit(1);

            // Fetch existing profile for persona
            const [profile] = await db
              .select()
              .from(usersProfiles)
              .where(eq(usersProfiles.userId, user.id))
              .limit(1);

            if (profile) {
              token.persona = profile.persona;
              token.role = dbUser?.role || null;
            } else {
              // Profile doesn't exist, create it (user is guaranteed to exist at this point)
              await db.insert(usersProfiles).values({
                userId: user.id,
                persona: "student",
                minor: false,
                guardianId: null,
                onboardingCompleted: false,
                primaryColor: null,
                secondaryColor: null,
              });
              token.persona = "student";
              token.role = dbUser?.role || null;
            }
          } catch (error) {
            // If profile creation fails (e.g., race condition), try to fetch it
            // This handles the case where profile was created between check and insert
            const [dbUser] = await db
              .select()
              .from(users)
              .where(eq(users.id, user.id))
              .limit(1);
            const [profile] = await db
              .select()
              .from(usersProfiles)
              .where(eq(usersProfiles.userId, user.id))
              .limit(1);
            if (profile) {
              token.persona = profile.persona;
              token.role = dbUser?.role || null;
            } else {
              // Fallback to defaults if profile still doesn't exist
              token.persona = "student";
              token.role = dbUser?.role || null;
            }
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
    async signIn({ user: _user, account: _account, profile: _profile }) {
      // Profile creation is handled in jwt callback after user is committed
      // Track invite.joined event if this is a new user with attribution
      // Note: We can't access cookies directly in signIn callback, so we'll track this
      // in a client component or API route that runs after sign-in
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
