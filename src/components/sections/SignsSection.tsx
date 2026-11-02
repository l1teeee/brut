"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const SIGN_WORDS: readonly string[] = ["Ripe now", "Hand-cut"];

const COLOR_STEPS = 4;

const SECTION_CLASSES =
  "relative h-svh overflow-hidden bg-chocolate text-apricot transition-colors duration-700 ease-out " +
  "data-[step=1]:bg-vanilla data-[step=1]:text-olive " +
  "data-[step=2]:bg-apricot data-[step=2]:text-chocolate " +
  "data-[step=3]:bg-olive data-[step=3]:text-vanilla";

export default function SignsSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const root = rootRef.current;
        if (!root) return;

        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "+=300%",
          pin: true,
          onUpdate: (self) => {
            const step = Math.min(COLOR_STEPS - 1, Math.floor(self.progress * COLOR_STEPS));
            root.dataset.step = String(step);
          },
        });

        return () => {
          delete root.dataset.step;
        };
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-labelledby="kitchen-title" className={SECTION_CLASSES}>
      <h2 id="kitchen-title" className="sr-only">
        Kitchen
      </h2>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[6vh] px-6 sm:flex-row sm:gap-[12vw]">
        {SIGN_WORDS.map((word) => (
          <p
            key={word}
            className="font-sans font-bold uppercase leading-none tracking-tight text-[clamp(1.75rem,3.6vw,3.25rem)]"
          >
            {word}
          </p>
        ))}
      </div>
    </section>
  );
}
