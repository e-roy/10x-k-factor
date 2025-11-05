import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { signIn, signOut } from "next-auth/react";

// Export auth function for server-side usage
export const {
  auth,
  signIn: serverSignIn,
  signOut: serverSignOut,
} = NextAuth(authConfig);

// Re-export getServerSession for convenience (NextAuth v5 uses auth() directly)
// Wrapped with error handling for invalid JWT sessions
export async function getServerSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    // If session is invalid (e.g., corrupted cookie or wrong secret), return null
    // This allows the app to continue and prompt for re-authentication
    console.warn("Failed to get session:", error);
    return null;
  }
}

// Wrapper for auth() that handles JWT errors gracefully
export async function getAuthSession() {
  try {
    return await auth();
  } catch (error) {
    // Handle JWT decryption errors gracefully
    if (
      error instanceof Error &&
      (error.message.includes("JWE") ||
        error.message.includes("JWT") ||
        error.message.includes("Invalid"))
    ) {
      // Invalid session cookie - likely due to secret change or corruption
      // Return null to allow re-authentication
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

// Client-side sign in/out helpers
export { signIn, signOut };
