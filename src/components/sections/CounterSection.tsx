"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const JAR_FIRST = 1;
const JAR_LAST = 96;

function formatJar(value: number): string {
  return `Jar-${String(Math.round(value)).padStart(3, "0")}`;
}

type Tone = "lime" | "blueberry" | "pink";

const TONE_CLASS: Record<Tone, string> = {
  lime: "text-lime",
  blueberry: "text-blueberry",
  pink: "text-pink",
};

type FruitWord = { text: string; tone: Tone; x: number; y: number };

const FRUIT_WORDS: FruitWord[] = [
  { text: "Pear", tone: "lime", x: 8, y: 18 },
  { text: "Plum", tone: "blueberry", x: 78, y: 14 },
  { text: "Fig", tone: "pink", x: 14, y: 72 },
  { text: "Cherry", tone: "pink", x: 70, y: 76 },
  { text: "Lime", tone: "lime", x: 84, y: 46 },
  { text: "Berry", tone: "blueberry", x: 4, y: 46 },
  { text: "Pear", tone: "lime", x: 42, y: 86 },
  { text: "Plum", tone: "pink", x: 46, y: 8 },
];

export default function CounterSection() {
  const rootRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const counterEl = counterRef.current;
        if (!counterEl) return;
        counterEl.textContent = formatJar(JAR_FIRST);

        const progress = { value: JAR_FIRST };

        gsap
          .timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "+=375%",
              pin: true,
              scrub: 1.2,
            },
          })
          .to(
            progress,
            {
              value: JAR_LAST,
              duration: 2,
              ease: "none",
              onUpdate: () => {
                counterEl.textContent = formatJar(progress.value);
              },
            },
            0,
          )
          .fromTo(
            "[data-counter-wrap]",
            { autoAlpha: 1, yPercent: 0 },
            { autoAlpha: 0, yPercent: -30, duration: 0.3, ease: "power2.in" },
            2,
          )
          .fromTo(
            "[data-headline]",
            { autoAlpha: 0, yPercent: 30 },
            { autoAlpha: 1, yPercent: 0, duration: 0.3, ease: "power2.out" },
            2.1,
          )
          .fromTo(
            "[data-fruit]",
            { autoAlpha: 0, scale: 0 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.3,
              ease: "back.out(2)",
              stagger: 0.04,
            },
            2.2,
          );

        return () => {
          counterEl.textContent = formatJar(JAR_LAST);
        };
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="party-title"
      className="relative h-svh overflow-hidden bg-vanilla"
    >
      <h2 id="party-title" className="sr-only">
        Fruit party
      </h2>

      <p className="absolute bottom-6 left-6 z-20 text-sm font-medium text-blueberry">brut 2026</p>

      <div
        data-counter-wrap
        className="invisible absolute inset-0 flex flex-col items-center justify-center gap-3"
      >
        <p className="text-sm font-medium lowercase tracking-tight text-pink">now filling</p>
        <p
          ref={counterRef}
          className="font-sans font-bold uppercase leading-none tracking-tight tabular-nums text-blueberry text-[clamp(3.5rem,13vw,11rem)]"
        >
          {formatJar(JAR_LAST)}
        </p>
      </div>

      <div
        data-headline
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
      >
        <p className="font-bold uppercase leading-[0.9] tracking-tight text-blueberry text-[clamp(3rem,11vw,9.5rem)]">
          Fruit party
        </p>
        <p className="mt-2 font-medium lowercase tracking-tight text-pink text-[clamp(1.5rem,4vw,3.5rem)]">
          on sunday
        </p>
      </div>

      <div aria-hidden="true" className="absolute inset-0">
        {FRUIT_WORDS.map((item) => (
          <span
            key={`${item.text}-${item.x}-${item.y}`}
            data-fruit
            className={`absolute font-sans font-bold uppercase leading-none tracking-tight text-[clamp(1.5rem,4vw,3.5rem)] ${TONE_CLASS[item.tone]}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </section>
  );
}
