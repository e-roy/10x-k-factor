"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginButton } from "@/components/LoginButton";

interface LoginFormProps {
  next: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
        />
        <label
          htmlFor="terms"
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
  );
}

