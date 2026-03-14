"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  city: string;
};

function formatDescription(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? "Weather unavailable");
        }
        return data;
      })
      .then((data) => {
        setWeather(data);
        setError(null);
      })
      .catch((err) => setError(err?.message ?? "Weather unavailable"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-4 shadow-sm ring-1 ring-stone-200/60 backdrop-blur-sm">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-stone-200" />
        <div className="flex flex-col gap-1">
          <div className="h-5 w-28 animate-pulse rounded bg-stone-200" />
          <div className="h-3.5 w-20 animate-pulse rounded bg-stone-100" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4">
        <p className="text-base font-medium text-amber-800">Weather unavailable</p>
        <p className="mt-0.5 text-sm text-amber-700">
          {error === "Weather API not configured"
            ? "Add OPENWEATHERMAP_API_KEY to .env.local and restart the dev server."
            : "Check your API key at openweathermap.org. New keys can take 10+ minutes to activate."}
        </p>
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-4 shadow-sm ring-1 ring-stone-200/60 backdrop-blur-sm">
      <img
        src={iconUrl}
        alt=""
        className="h-12 w-12"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-stone-800">
          {weather.temp}°C
        </span>
        <span className="text-sm text-stone-600">
          {weather.city} · {formatDescription(weather.description)}
        </span>
      </div>
    </div>
  );
}
