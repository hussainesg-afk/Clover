"use client";

import { useState, useRef } from "react";
import { db } from "@/lib/db";

export default function Login() {
  const [sentEmail, setSentEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        {!sentEmail ? (
          <EmailStep
            onSendEmail={setSentEmail}
            isSending={isSending}
            setIsSending={setIsSending}
            error={error}
            setError={setError}
          />
        ) : (
          <CodeStep
            sentEmail={sentEmail}
            onBack={() => setSentEmail("")}
            isVerifying={isVerifying}
            setIsVerifying={setIsVerifying}
            error={error}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}

function EmailStep({
  onSendEmail,
  isSending,
  setIsSending,
  error,
  setError,
}: {
  onSendEmail: (email: string) => void;
  isSending: boolean;
  setIsSending: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = inputRef.current?.value?.trim();
    if (!email) return;

    setError(null);
    setIsSending(true);
    onSendEmail(email);

    db.auth
      .sendMagicCode({ email })
      .catch((err) => {
        setError(err?.body?.message ?? "Failed to send code. Please try again.");
        onSendEmail("");
      })
      .finally(() => setIsSending(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-stone-900">Sign in to Clover</h2>
      <p className="text-sm text-stone-600">
        Enter your email and we&apos;ll send you a verification code. We&apos;ll create an
        account for you if you don&apos;t already have one.
      </p>
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error}</div>
      )}
      <input
        ref={inputRef}
        type="email"
        placeholder="Enter your email"
        required
        autoFocus
        disabled={isSending}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isSending}
        className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
      >
        {isSending ? "Sending..." : "Send code"}
      </button>
    </form>
  );
}

function CodeStep({
  sentEmail,
  onBack,
  isVerifying,
  setIsVerifying,
  error,
  setError,
}: {
  sentEmail: string;
  onBack: () => void;
  isVerifying: boolean;
  setIsVerifying: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = inputRef.current?.value?.trim();
    if (!code) return;

    setError(null);
    setIsVerifying(true);

    db.auth
      .signInWithMagicCode({ email: sentEmail, code })
      .catch((err) => {
        setError(err?.body?.message ?? "Invalid code. Please try again.");
        inputRef.current!.value = "";
      })
      .finally(() => setIsVerifying(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-stone-900">Enter your code</h2>
      <p className="text-sm text-stone-600">
        We sent an email to <strong className="text-stone-900">{sentEmail}</strong>.
        Check your inbox and paste the code below.
      </p>
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error}</div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder="123456"
        required
        autoFocus
        disabled={isVerifying}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isVerifying}
        className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
      >
        {isVerifying ? "Verifying..." : "Verify code"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-stone-500 hover:text-stone-700"
      >
        ← Use a different email
      </button>
    </form>
  );
}
