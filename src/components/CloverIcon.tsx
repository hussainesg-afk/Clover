"use client";

/**
 * Four-leaf clover icon - used for branding across the app.
 * Four overlapping circles create a recognizable clover silhouette.
 */
export default function CloverIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
      aria-hidden
    >
      {/* Four-leaf clover: 4 overlapping circles meeting at center */}
      <circle cx="32" cy="20" r="14" />
      <circle cx="44" cy="32" r="14" />
      <circle cx="32" cy="44" r="14" />
      <circle cx="20" cy="32" r="14" />
    </svg>
  );
}
