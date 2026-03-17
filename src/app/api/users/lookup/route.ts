import { NextRequest, NextResponse } from "next/server";
import { getApps, getApp, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      const cred = JSON.parse(serviceAccountJson) as ServiceAccount;
      return initializeApp({ credential: cert(cred) });
    } catch {
      return null;
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp();
  }
  return null;
}

async function lookupByEmail(email: string) {
  const app = getFirebaseAdminApp();
  if (!app) {
    return NextResponse.json(
      { error: "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS." },
      { status: 503 }
    );
  }

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
  }

  try {
    const auth = getAuth(app);
    const user = await auth.getUserByEmail(trimmed);
    return NextResponse.json({
      uid: user.uid,
      displayName: user.displayName ?? undefined,
    });
  } catch (err: unknown) {
    const msg = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (msg === "auth/user-not-found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Firebase Admin getUserByEmail error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing or invalid email parameter" }, { status: 400 });
  }
  return lookupByEmail(email);
}

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = body?.email;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing or invalid email in body" }, { status: 400 });
  }
  return lookupByEmail(email);
}
