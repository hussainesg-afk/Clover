import { NextResponse } from "next/server";

const BRISTOL_LAT = 51.4545;
const BRISTOL_LON = -2.5879;

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Weather API not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${BRISTOL_LAT}&lon=${BRISTOL_LON}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenWeatherMap error:", res.status, text);
      return NextResponse.json(
        { error: "Weather service unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0]?.description ?? "",
      icon: data.weather[0]?.icon ?? "01d",
      humidity: data.main.humidity,
      city: data.name ?? "Bristol",
    });
  } catch (err) {
    console.error("Weather fetch error:", err);
    return NextResponse.json(
      { error: "Weather service unavailable" },
      { status: 502 }
    );
  }
}
