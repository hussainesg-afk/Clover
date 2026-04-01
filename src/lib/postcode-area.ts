/**
 * Resolve a human-readable overarching area from a UK postcode using Postcodes.io.
 */

function formatAdminDistrict(district: string): string {
  const d = district.trim();
  if (/^Bristol,\s*City of$/i.test(d)) return "Bristol";
  return d.replace(/,\s*City of$/i, "").trim();
}

/**
 * Returns a broad area label (e.g. local authority / city) for display.
 */
export async function fetchPostcodeAreaLabel(
  postcode: string
): Promise<string | null> {
  const trimmed = postcode.trim();
  if (!trimmed) return null;

  const encoded = encodeURIComponent(trimmed.replace(/\s+/g, "").toUpperCase());

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`, {
      method: "GET",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: number;
      result?: { admin_district?: string; region?: string };
    };

    const r = data?.result;
    if (!r) return null;

    if (r.admin_district) {
      return formatAdminDistrict(r.admin_district);
    }
    if (r.region) {
      return r.region;
    }
    return null;
  } catch {
    return null;
  }
}
