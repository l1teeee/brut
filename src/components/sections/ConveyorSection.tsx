"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Tone = "cherry" | "forest";

const TONE_CLASS: Record<Tone, string> = {
  cherry: "text-cherry",
  forest: "text-forest",
};

type Belt = {
  number: string;
  words: { text: string; tone: Tone }[];
  fromPercent: number;
  toPercent: number;
};

const BELTS: Belt[] = [
  {
    number: "1",
    words: Array.from({ length: 16 }, () => ({ text: "Cherry", tone: "cherry" as const })),
    fromPercent: 0,
    toPercent: -50,
  },
  {
    number: "2",
    words: Array.from({ length: 16 }, (_, i) =>
      i % 2 === 0
        ? { text: "Cherry", tone: "cherry" as const }
        : { text: "Stem", tone: "forest" as const },
    ),
    fromPercent: -50,
    toPercent: 0,
  },
  {
    number: "3",
    words: Array.from({ length: 16 }, () => ({ text: "Cherry", tone: "cherry" as const })),
    fromPercent: -10,
    toPercent: -60,
  },
];

export default function ConveyorSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 1.2,
          },
        });
        BELTS.forEach((belt, index) => {
          timeline.fromTo(
            `[data-belt='${index}']`,
            { xPercent: belt.fromPercent },
            { xPercent: belt.toPercent, ease: "none", duration: 1 },
            0,
          );
        });
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="sorting-title"
      className="relative h-svh overflow-hidden bg-purple"
    >
      <h2 id="sorting-title" className="sr-only">
        Sorting
      </h2>

      <div className="absolute inset-0 flex flex-col justify-center gap-[6vh] px-6">
        {BELTS.map((belt, index) => (
          <div key={belt.number} className="flex items-center gap-[3vw]">
            <p
              aria-hidden="true"
              className="w-[12vw] shrink-0 text-right font-bold leading-none tracking-tight text-milk text-[clamp(3rem,10vw,9rem)]"
            >
              {belt.number}
            </p>
            <div
              aria-hidden="true"
              className="min-w-0 flex-1 overflow-hidden border-y-2 border-forest py-[1.5vh]"
            >
              <div data-belt={index} className="flex w-max gap-[3vw] whitespace-nowrap">
                {belt.words.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={`font-sans font-bold uppercase leading-none tracking-tight text-[clamp(1.25rem,2.6vw,2.25rem)] ${TONE_CLASS[word.tone]}`}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
