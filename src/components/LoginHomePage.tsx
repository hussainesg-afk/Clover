"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { GoogleLogin } from "@react-oauth/google";
import CloverIcon from "@/components/CloverIcon";
import { db } from "@/lib/db";
import {
  getFirebaseAuth,
  FIREBASE_CLIENT_NAME,
  isFirebaseConfigured,
} from "@/lib/firebase";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_NAME = process.env.NEXT_PUBLIC_INSTANT_GOOGLE_CLIENT_NAME ?? "";

export type UserType = "host" | "community";

const HOST_SUBHEADER =
  "Sign in to your host dashboard and see what's happening locally.";
const COMMUNITY_SUBHEADER =
  "Sign in to discover events and connect with your local community.";

interface LoginHomePageProps {
  userType?: UserType;
}

export default function LoginHomePage({ userType: initialUserType }: LoginHomePageProps) {
  const pathname = usePathname();
  const userType = initialUserType ?? (pathname.startsWith("/host") ? "host" : "community");
  const [sentEmail, setSentEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subheader =
    userType === "host" ? HOST_SUBHEADER : COMMUNITY_SUBHEADER;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
            <CloverIcon size={32} className="text-teal-600" />
          </div>
        </div>
        {/* User type selector - navigates between community and host areas */}
        <div className="mb-8 flex overflow-hidden rounded-full border border-stone-200 bg-stone-100/50 p-1">
          <Link
            href="/host"
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
              userType === "host"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-200/50"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Host / Venue
          </Link>
          <Link
            href="/"
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
              userType === "community"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-200/50"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Community member
          </Link>
        </div>

        {/* Welcome message */}
        <h1 className="text-2xl font-bold text-stone-900">
          Welcome back
        </h1>
        <p className="mt-2 text-stone-600">{subheader}</p>

        {/* Form */}
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

        {/* Create account link */}
        <p className="mt-8 text-center text-sm text-stone-500">
          New to Clover?{" "}
          <Link
            href={userType === "host" ? "/signup?redirect=/host" : "/signup"}
            className="font-medium text-teal-600 hover:text-teal-700"
          >
            Create an account →
          </Link>
        </p>
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
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [usePassword, setUsePassword] = useState(isFirebaseConfigured());
  const firebaseConfigured = isFirebaseConfigured();

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value;
    if (!email || !password) return;

    setError(null);
    setIsSending(true);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Email sign-in is not configured.");
      setIsSending(false);
      return;
    }

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await user.getIdToken();
      await db.auth.signInWithIdToken({
        idToken,
        clientName: FIREBASE_CLIENT_NAME,
      });
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: unknown }).message) : "";
      const isAlreadyLinked = msg.includes("$oauthUserLinks") && msg.includes("unique");
      setError(
        code === "auth/invalid-credential" || code === "auth/user-not-found"
          ? "Invalid email or password."
          : isAlreadyLinked
            ? "This email is already linked to another sign-in method. Use the verification code instead."
            : (err as { message?: string }).message ?? "Sign-in failed. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleMagicCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim();
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

  const usePopupFlow = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_NAME;
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);
  const [googleNonce] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
  );
  // #region agent log
  useEffect(() => {
    if (typeof window !== "undefined" && usePopupFlow) {
      fetch("http://127.0.0.1:7899/ingest/aef72d50-c03c-4543-893c-ac60c4e175db", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "768e66" },
        body: JSON.stringify({
          sessionId: "768e66",
          location: "LoginHomePage.tsx:EmailStep",
          message: "Google auth context",
          data: { origin: window.location.origin, href: window.location.href, usePopupFlow: !!usePopupFlow },
          timestamp: Date.now(),
          hypothesisId: "B",
        }),
      }).catch(() => {});
    }
  }, [usePopupFlow]);
  // #endregion
  useEffect(() => {
    if (!usePopupFlow && GOOGLE_CLIENT_NAME && typeof window !== "undefined") {
      setGoogleAuthUrl(
        db.auth.createAuthorizationURL({
          clientName: GOOGLE_CLIENT_NAME,
          redirectURL: window.location.origin + "/",
        })
      );
    }
  }, [usePopupFlow, GOOGLE_CLIENT_NAME]);

  const handleSubmit = firebaseConfigured && usePassword ? handlePasswordSignIn : handleMagicCode;

  return (
    <div className="mt-8 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          Email address
        </label>
        <input
          ref={emailRef}
          type="email"
          placeholder="you@example.com"
          required
          autoFocus
          disabled={isSending}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Password
          </label>
          {firebaseConfigured && (
            <button
              type="button"
              onClick={() => setUsePassword(!usePassword)}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              {usePassword ? "Use verification code instead" : "Use password instead"}
            </button>
          )}
          {!firebaseConfigured && (
            <span className="text-xs font-medium text-teal-600 hover:text-teal-700">
              Forgot password?
            </span>
          )}
        </div>
        {firebaseConfigured && usePassword ? (
          <input
            ref={passwordRef}
            type="password"
            placeholder="Enter your password"
            required
            disabled={isSending}
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
          />
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder={firebaseConfigured ? "We'll email you a verification code" : "We'll email you a verification code"}
              disabled
              className="w-full rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 pr-12 text-stone-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
      >
        {isSending
          ? usePassword && firebaseConfigured
            ? "Signing in..."
            : "Sending code..."
          : "Sign in to Clover"}
      </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--background)] px-3 text-xs font-medium uppercase tracking-wider text-stone-400">
            Or
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {usePopupFlow ? (
          <div className="flex flex-1">
            <GoogleLogin
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
              nonce={googleNonce}
              ux_mode="redirect"
              onSuccess={async ({ credential }) => {
                if (!credential) return;
                setError(null);
                // #region agent log
                fetch("http://127.0.0.1:7899/ingest/aef72d50-c03c-4543-893c-ac60c4e175db", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "768e66" },
                  body: JSON.stringify({
                    sessionId: "768e66",
                    location: "LoginHomePage.tsx:GoogleLogin:onSuccess",
                    message: "Google sign-in success",
                    data: { hasCredential: !!credential },
                    timestamp: Date.now(),
                    hypothesisId: "A",
                  }),
                }).catch(() => {});
                // #endregion
                try {
                  await db.auth.signInWithIdToken({
                    clientName: GOOGLE_CLIENT_NAME,
                    idToken: credential,
                    nonce: googleNonce,
                  });
                } catch (err) {
                  const msg =
                    err && typeof err === "object" && "body" in err && (err as { body?: { message?: string } }).body?.message;
                  setError(typeof msg === "string" ? msg : "Google sign-in failed. Please try again.");
                }
              }}
              onError={() => {
                setError("Google sign-in was cancelled or failed.");
              }}
            />
          </div>
        ) : googleAuthUrl ? (
          <a
            href={googleAuthUrl}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </a>
        ) : null}
        <button
          type="button"
          disabled
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-medium text-stone-400"
          title="Coming soon"
        >
          <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </div>
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
        if (inputRef.current) inputRef.current.value = "";
      })
      .finally(() => setIsVerifying(false));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          Verification code
        </label>
        <p className="mb-2 text-sm text-stone-600">
          We sent a code to <strong className="text-stone-900">{sentEmail}</strong>
        </p>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          required
          autoFocus
          disabled={isVerifying}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isVerifying}
        className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
      >
        {isVerifying ? "Verifying..." : "Sign in to Clover"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-stone-500 hover:text-stone-700"
      >
        ← Use a different email
      </button>
    </form>
  );
}
