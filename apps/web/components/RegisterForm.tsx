"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// SessionStorage keys for form state persistence (shared with LoginForm)
const STORAGE_KEYS = {
  EMAIL: "auth_form_email",
  PASSWORD: "auth_form_password",
  NAME: "auth_form_name",
} as const;

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved form values from sessionStorage on mount
  useEffect(() => {
    // Check URL params first (for direct navigation)
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Fall back to sessionStorage
      const savedEmail = sessionStorage.getItem(STORAGE_KEYS.EMAIL);
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }

    const savedName = sessionStorage.getItem(STORAGE_KEYS.NAME);
    if (savedName) {
      setName(savedName);
    }

    const savedPassword = sessionStorage.getItem(STORAGE_KEYS.PASSWORD);
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, [searchParams]);

  // Save form values to sessionStorage when they change
  useEffect(() => {
    if (email) {
      sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);
    }
  }, [email]);

  useEffect(() => {
    if (name) {
      sessionStorage.setItem(STORAGE_KEYS.NAME, name);
    }
  }, [name]);

  useEffect(() => {
    if (password) {
      sessionStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
        setIsLoading(false);
      } else if (result?.ok) {
        // Clear saved form values on successful registration
        sessionStorage.removeItem(STORAGE_KEYS.EMAIL);
        sessionStorage.removeItem(STORAGE_KEYS.PASSWORD);
        sessionStorage.removeItem(STORAGE_KEYS.NAME);
        
        // Check for guest session to convert
        const guestSessionId = localStorage.getItem("guest_session_id");
        
        if (guestSessionId) {
          try {
            // Convert guest completions to real user
            const conversionResponse = await fetch("/api/auth/convert-guest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ guestSessionId }),
            });

            if (conversionResponse.ok) {
              const conversionData = await conversionResponse.json();
              console.log("[RegisterForm] Guest conversion successful:", conversionData);
              
              // Clear guest data
              localStorage.removeItem("guest_session_id");
              localStorage.removeItem("challenge_attribution");
              localStorage.removeItem("guest_completion_context");
              
              // Dispatch XP earned event for sidebar refresh
              if (conversionData.xpEarned > 0) {
                window.dispatchEvent(new CustomEvent("xpEarned", {
                  detail: { amount: conversionData.xpEarned },
                }));
              }
            }
          } catch (conversionError) {
            console.error("[RegisterForm] Guest conversion error:", conversionError);
            // Don't block registration flow if conversion fails
          }
        }

        // Use window.location for a full page reload to avoid timeout issues
        window.location.href = "/app";
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name (optional)</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !email || !password || !confirmPassword}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="text-primary underline hover:no-underline"
          onClick={() => {
            // Ensure current values are saved before navigating
            if (email) {
              sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);
            }
            if (name) {
              sessionStorage.setItem(STORAGE_KEYS.NAME, name);
            }
            if (password) {
              sessionStorage.setItem(STORAGE_KEYS.PASSWORD, password);
            }
          }}
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
