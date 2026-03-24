/**
 * InstantDB app id for server routes (admin API, etc.).
 * Prefer NEXT_PUBLIC_INSTANT_APP_ID; set INSTANT_APP_ID to the same value on Vercel
 * if the public var is not available to the server bundle.
 */
export function getInstantAppIdForServer(): string | undefined {
  const pub = process.env.NEXT_PUBLIC_INSTANT_APP_ID?.trim();
  if (pub) return pub;
  return process.env.INSTANT_APP_ID?.trim();
}

export function getInstantAdminToken(): string | undefined {
  return process.env.INSTANT_APP_ADMIN_TOKEN?.trim();
}

export function instantServerConfigured(): boolean {
  return Boolean(getInstantAppIdForServer() && getInstantAdminToken());
}
