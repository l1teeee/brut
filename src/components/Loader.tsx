"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const FADE_SECONDS = 0.6;

function waitForPageLoad(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

export default function Loader() {
  const loaderRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    let cancelled = false;
    void Promise.all([waitForPageLoad(), document.fonts.ready]).then(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(loader, { autoAlpha: 0, duration: reduceMotion ? 0 : FADE_SECONDS, ease: "power2.out" });
    });

    return () => {
      cancelled = true;
    };
  });

  return (
    <div
      ref={loaderRef}
      aria-hidden="true"
      className="fixed inset-0 z-[60] bg-linear-to-b from-sky-deep to-sky-soft"
    />
  );
}
