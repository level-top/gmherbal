"use client";

import Image from "next/image";

export function BackgroundSpinner() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 opacity-10 sm:h-96 sm:w-96">
        <div className="h-full w-full animate-spin" style={{ animationDuration: "18s", animationDirection: "reverse" }}>
          <Image
            src="/logo%20(4).png"
            alt=""
            width={768}
            height={768}
            className="h-full w-full object-contain"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
