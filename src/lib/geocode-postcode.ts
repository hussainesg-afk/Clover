/**
 * Geocode UK postcodes to lat/lng using Postcodes.io (free, no API key).
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Geocode a UK postcode to coordinates.
 * @returns { lat, lng } on success, null if invalid or network error.
 */
export async function geocodePostcode(
  postcode: string
): Promise<GeocodeResult | null> {
  const trimmed = postcode.trim();
  if (!trimmed) return null;

  // Normalize for URL: remove spaces
  const encoded = encodeURIComponent(trimmed.replace(/\s+/g, "").toUpperCase());

  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encoded}`,
      { method: "GET" }
    );

    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: number;
      result?: { latitude?: number; longitude?: number };
    };

    const lat = data?.result?.latitude;
    const lng = data?.result?.longitude;

    if (typeof lat !== "number" || typeof lng !== "number") return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
