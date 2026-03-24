import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { getApps, getApp, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const INSTANT_API = "https://api.instantdb.com";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    const absPath = join(process.cwd(), filePath);
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absPath;
    }
    return initializeApp();
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      let cred = JSON.parse(serviceAccountJson) as ServiceAccount;
      if (cred.privateKey && typeof cred.privateKey === "string") {
        cred = { ...cred, privateKey: cred.privateKey.replace(/\\n/g, "\n") };
      }
      return initializeApp({ credential: cert(cred) });
    } catch (err) {
      console.error("[lookup] FIREBASE_SERVICE_ACCOUNT failed:", err);
      return null;
    }
  }

  return null;
}

async function lookupByInstantDB(email: string): Promise<{ uid: string; displayName?: string } | null> {
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId || !adminToken) return null;

  try {
    const res = await fetch(
      `${INSTANT_API}/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "App-Id": appId,
        },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as
      | { user?: { id: string; displayName?: string } }
      | { id: string; displayName?: string };
    const user = (data && "user" in data ? data.user : data) as { id: string; displayName?: string } | undefined;
    if (!user?.id) return null;
    return {
      uid: user.id,
      displayName: user.displayName,
    };
  } catch {
    return null;
  }
}

async function lookupByFirebase(email: string): Promise<{ uid: string; displayName?: string } | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;

  try {
    const auth = getAuth(app);
    const user = await auth.getUserByEmail(email);
    return {
      uid: user.uid,
      displayName: user.displayName ?? undefined,
    };
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (code === "auth/user-not-found") return null;
    console.error("[lookup] Firebase getUserByEmail error:", err);
    return null;
  }
}

async function lookupByEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
  }

  let result = await lookupByInstantDB(trimmed);
  if (!result) {
    result = await lookupByFirebase(trimmed);
  }

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    uid: result.uid,
    displayName: result.displayName,
  });
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing or invalid email parameter" }, { status: 400 });
    }
    return await lookupByEmail(email);
  } catch (err) {
    console.error("[lookup] GET unhandled error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
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
