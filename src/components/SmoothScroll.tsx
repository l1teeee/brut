"use client";

import { useRef } from "react";
import { gsap, ScrollSmoother, useGSAP } from "@/lib/gsap";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 2,
        smoothTouch: 0.1,
        effects: false,
      });
      return () => smoother.kill();
    });
    return () => media.revert();
  });

  return (
    <div ref={wrapperRef}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
