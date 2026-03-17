"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import SignupForm from "@/components/SignupForm";
import CloverIcon from "@/components/CloverIcon";

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, user } = db.useAuth();
  const redirectTo = searchParams.get("redirect") ?? "/";

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo.startsWith("/") ? redirectTo : "/");
    }
  }, [isLoading, user, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
            <CloverIcon size={32} className="text-teal-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">
          Create your account
        </h1>
        <p className="mt-2 text-stone-600">
          Join Clover with Google or create an account with your email.
        </p>

        <div className="mt-8">
          <SignupForm />
        </div>

        <p className="mt-8 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link
            href="/"
            className="font-medium text-teal-600 hover:text-teal-700"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
