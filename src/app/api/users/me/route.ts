import { NextRequest, NextResponse } from "next/server";

const INSTANT_API = "https://api.instantdb.com";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId || !adminToken) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${INSTANT_API}/admin/users?id=${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "App-Id": appId,
      },
    });
    if (!res.ok) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const data = (await res.json()) as { user?: { id: string; email?: string } } | { id: string; email?: string };
    const user = (data && "user" in data ? data.user : data) as { id: string; email?: string } | undefined;
    if (!user?.id) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ email: user.email ?? null });
  } catch (err) {
    console.error("[me] Error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
