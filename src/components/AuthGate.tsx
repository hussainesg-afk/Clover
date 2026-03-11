"use client";

import { db } from "@/lib/db";
import Login from "./Login";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <db.SignedIn>{children}</db.SignedIn>
      <db.SignedOut>
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/30 p-8 shadow-md">
          <Login />
        </div>
      </db.SignedOut>
    </>
  );
}
