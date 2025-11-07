"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  next?: string;
}

export function LoginButton({ next = "/app" }: LoginButtonProps) {
  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: next })}
      size="lg"
    >
      Sign in with Google
    </Button>
  );
}
