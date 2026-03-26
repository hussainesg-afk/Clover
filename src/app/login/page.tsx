"use client";

import { db } from "@/lib/db";
import Login from "@/components/Login";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, user } = db.useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Sign in</h1>
      <p className="mt-1 text-stone-600">
        Sign in to save your preferences and get personalized event recommendations.
      </p>
      <div className="mt-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-md">
          <Login />
        </div>
      </div>
    </div>
  );
}
