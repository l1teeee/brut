"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// Must match the thumb's h-[12%] class.
const THUMB_RATIO = 0.12;
const THUMB_TRAVEL_PERCENT = ((1 - THUMB_RATIO) / THUMB_RATIO) * 100;

export default function ScrollIndicator() {
  const thumbRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;

    const setThumbY = gsap.quickSetter(thumb, "yPercent");
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setThumbY(self.progress * THUMB_TRAVEL_PERCENT),
    });
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-2 right-1 top-2 z-50 w-[3px]"
    >
      <div
        ref={thumbRef}
        className="h-[12%] w-full rounded-full bg-white/70 mix-blend-difference"
      />
    </div>
  );
}
