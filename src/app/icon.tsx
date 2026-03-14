import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d9488",
          borderRadius: 8,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="white"
          width={24}
          height={24}
        >
          <circle cx="32" cy="20" r="14" />
          <circle cx="44" cy="32" r="14" />
          <circle cx="32" cy="44" r="14" />
          <circle cx="20" cy="32" r="14" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
