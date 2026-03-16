"use client";

import { db } from "@/lib/db";
import LoginHomePage from "./LoginHomePage";

export default function HostAuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <db.SignedIn>{children}</db.SignedIn>
      <db.SignedOut>
        <LoginHomePage userType="host" />
      </db.SignedOut>
    </>
  );
}
