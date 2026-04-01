import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const logoBytes = readFileSync(join(process.cwd(), "src", "assets", "clover-logo.png"));
  const b64 = logoBytes.toString("base64");
  const dataUri = `data:image/png;base64,${b64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafaf9",
          borderRadius: 6,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={28} height={28} alt="" />
      </div>
    ),
    { ...size },
  );
}
