"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const COLOR_STEPS = 7;

const COLOR_TRANSITION = "transition-colors duration-700 ease-out";

const SECTION_CLASSES = "group relative h-svh overflow-hidden bg-sky-soft";

const BACKGROUND_CLASSES =
  `absolute inset-0 rounded-t-[2.5rem] bg-chocolate ${COLOR_TRANSITION} ` +
  "group-data-[step=3]:bg-olive group-data-[step=4]:bg-vanilla group-data-[step=5]:bg-apricot";

const LEFT_WORD_CLASSES =
  `text-apricot ${COLOR_TRANSITION} ` +
  "group-data-[step=1]:text-vanilla group-data-[step=2]:text-vanilla group-data-[step=3]:text-vanilla " +
  "group-data-[step=4]:text-chocolate group-data-[step=5]:text-vanilla";

const RIGHT_WORD_CLASSES =
  `text-apricot ${COLOR_TRANSITION} ` +
  "group-data-[step=2]:text-vanilla group-data-[step=3]:text-vanilla " +
  "group-data-[step=4]:text-olive group-data-[step=5]:text-chocolate group-data-[step=6]:text-vanilla";

const WORD_CLASSES =
  "font-sans font-bold uppercase leading-none tracking-tight text-[clamp(1.75rem,3.6vw,3.25rem)]";

const SIGN_WORDS: readonly { text: string; classes: string }[] = [
  { text: "Ripe now", classes: LEFT_WORD_CLASSES },
  { text: "Hand-cut", classes: RIGHT_WORD_CLASSES },
];

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
          end: "+=500%",
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
      <div aria-hidden="true" className={BACKGROUND_CLASSES} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[6vh] px-6 sm:flex-row sm:gap-[12vw]">
        {SIGN_WORDS.map((word) => (
          <p key={word.text} className={`${WORD_CLASSES} ${word.classes}`}>
            {word.text}
          </p>
        ))}
      </div>
    </section>
  );
}
