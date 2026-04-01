"use client";

import { useState } from "react";
import Image from "next/image";
import cloverLogo from "@/assets/clover-logo.png";

export default function LoadingScreen() {
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-stone-50 transition-opacity duration-300 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="animate-logo-spin"
          onAnimationEnd={() => {
            setTimeout(() => setDone(true), 250);
          }}
        >
          <Image
            src={cloverLogo}
            alt="Clover"
            width={80}
            height={80}
            style={{ mixBlendMode: "multiply" }}
            priority
            draggable={false}
          />
        </div>
        <span className="text-lg font-semibold tracking-tight text-stone-700">
          Clover
        </span>
      </div>
    </div>
  );
}
