"use client";

import Image from "next/image";
import cloverLogo from "@/assets/clover-logo.png";

/**
 * Four-leaf clover icon -- used for branding across the app.
 * Renders the official Clover logo PNG instead of an inline SVG.
 */
export default function CloverIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={cloverLogo}
      alt="Clover"
      width={size}
      height={size}
      className={className}
      style={{ mixBlendMode: "multiply" }}
      draggable={false}
      sizes={`${size}px`}
    />
  );
}
