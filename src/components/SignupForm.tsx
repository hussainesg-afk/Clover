"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { GoogleLogin } from "@react-oauth/google";
import { db } from "@/lib/db";
import {
  getFirebaseAuth,
  FIREBASE_CLIENT_NAME,
  isFirebaseConfigured,
} from "@/lib/firebase";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_NAME = process.env.NEXT_PUBLIC_INSTANT_GOOGLE_CLIENT_NAME ?? "";

export default function SignupForm() {
  const usePopupFlow = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_NAME;
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);
  const [googleNonce] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!usePopupFlow && GOOGLE_CLIENT_NAME && typeof window !== "undefined") {
      setGoogleAuthUrl(
        db.auth.createAuthorizationURL({
          clientName: GOOGLE_CLIENT_NAME,
          redirectURL: window.location.origin + "/signup",
        })
      );
    }
  }, [usePopupFlow, GOOGLE_CLIENT_NAME]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Email sign-up is not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await user.getIdToken();
      await db.auth.signInWithIdToken({
        idToken,
        clientName: FIREBASE_CLIENT_NAME,
      });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: unknown }).message) : "";
      const isAlreadyLinked = msg.includes("$oauthUserLinks") && msg.includes("unique");
      const message =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string; message?: string }).code === "auth/email-already-in-use"
            ? "An account with this email already exists. Try signing in instead."
            : isAlreadyLinked
              ? "This email is already registered. Sign in with the verification code or use the password field on the sign-in page."
              : (err as { message?: string }).message ?? "Sign-up failed. Please try again."
          : isAlreadyLinked
            ? "This email is already registered. Sign in with the verification code or use the password field on the sign-in page."
            : "Sign-up failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google signup */}
      {usePopupFlow ? (
        <div className="flex justify-center">
          <GoogleLogin
            theme="filled_blue"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
            nonce={googleNonce}
            onSuccess={async ({ credential }) => {
              if (!credential) return;
              setError(null);
              try {
                await db.auth.signInWithIdToken({
                  clientName: GOOGLE_CLIENT_NAME,
                  idToken: credential,
                  nonce: googleNonce,
                });
              } catch (err) {
                const msg =
                  err && typeof err === "object" && "body" in err && (err as { body?: { message?: string } }).body?.message;
                setError(msg ?? "Google sign-up failed. Please try again.");
              }
            }}
            onError={() => {
              setError("Google sign-up was cancelled or failed.");
            }}
          />
        </div>
      ) : googleAuthUrl ? (
        <a
          href={googleAuthUrl}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-teal-600 bg-teal-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:border-teal-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="white"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="white"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="white"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="white"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </a>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Google sign-up not configured</p>
          <p className="mt-1 text-amber-700">
            Add <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> (Google OAuth Client ID) and <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_INSTANT_GOOGLE_CLIENT_NAME</code> (InstantDB client name). See README for setup.
          </p>
        </div>
      )}

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--background)] px-3 text-xs font-medium uppercase tracking-wider text-stone-400">
            Or use email
          </span>
        </div>
      </div>

      {/* Email + password signup */}
      {isFirebaseConfigured() ? (
        <form onSubmit={handleEmailSignup} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              Email address
            </label>
            <input
              ref={emailInputRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-teal-600 bg-white px-4 py-3.5 font-semibold text-teal-600 transition hover:bg-teal-50 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account with email"}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          <p className="font-medium text-stone-700">Email sign-up</p>
          <p className="mt-1">
            To enable email + password sign-up, add Firebase Auth. See the README for setup.
          </p>
          <p className="mt-3">
            <Link href="/" className="font-medium text-teal-600 hover:text-teal-700">
              Sign in with a verification code
            </Link>{" "}
            — we&apos;ll create an account if you don&apos;t have one.
          </p>
        </div>
      )}
    </div>
  );
}
