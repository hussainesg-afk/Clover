"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/db";
import {
  getFirebaseAuth,
  FIREBASE_CLIENT_NAME,
  isFirebaseConfigured,
} from "@/lib/firebase";

function isAlreadyLinkedError(err: unknown): boolean {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message)
      : "";
  return msg.includes("$oauthUserLinks") && msg.includes("unique");
}

/**
 * Syncs Firebase Auth state to InstantDB. When a user is signed into Firebase
 * (e.g. via email+password), we sign them into InstantDB with the Firebase JWT.
 */
export default function FirebaseAuthSync() {
  const { user: instantUser } = db.useAuth();

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Skip if already signed into InstantDB with the same email (avoids duplicate link)
        if (instantUser?.email === firebaseUser.email) return;

        try {
          const idToken = await firebaseUser.getIdToken();
          await db.auth.signInWithIdToken({
            idToken,
            clientName: FIREBASE_CLIENT_NAME,
          });
        } catch (err) {
          // User's Firebase identity is already linked to InstantDB (e.g. same email used with magic code)
          if (isAlreadyLinkedError(err)) {
            return; // Silently ignore - user may need to sign in via their original method
          }
          console.error("Firebase -> InstantDB sync failed:", err);
        }
      } else {
        // Don't sign out of InstantDB here - user might be signed in via
        // magic code or Google. Only sync sign-in, not sign-out.
      }
    });

    return () => unsubscribe();
  }, [instantUser?.email]);

  return null;
}
