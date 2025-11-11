"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginButton } from "@/components/LoginButton";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LoginFormProps {
  next: string;
}

// SessionStorage keys for form state persistence
const STORAGE_KEYS = {
  EMAIL: "auth_form_email",
  PASSWORD: "auth_form_password",
  NAME: "auth_form_name",
} as const;

export function LoginForm({ next }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (password) {
      sessionStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    }
  }, [password]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else if (result?.ok) {
        // Clear saved form values on successful login
        sessionStorage.removeItem(STORAGE_KEYS.EMAIL);
        sessionStorage.removeItem(STORAGE_KEYS.PASSWORD);
        sessionStorage.removeItem(STORAGE_KEYS.NAME);
        
        // Use window.location for a full page reload to avoid timeout issues
        window.location.href = next;
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email/Password Sign In */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
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
          />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="terms-email"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="terms-email"
            className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
          </label>
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !email || !password || !termsAccepted}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className="text-primary underline hover:no-underline"
            onClick={() => {
              // Ensure current values are saved before navigating
              if (email) {
                sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);
              }
              if (password) {
                sessionStorage.setItem(STORAGE_KEYS.PASSWORD, password);
              }
            }}
          >
            Sign up
          </Link>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign In */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="terms-google"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <label
            htmlFor="terms-google"
            className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
          </label>
        </div>
        <LoginButton next={next} disabled={!termsAccepted} />
      </div>
    </div>
  );
}
