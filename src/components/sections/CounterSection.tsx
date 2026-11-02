"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const JAR_FIRST = 1;
const JAR_LAST = 96;

const DIGIT_CELLS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const WHEEL_KEYS: readonly string[] = ["hundreds", "tens", "ones"];

const HEAT_FULL_VELOCITY = 3000;
const HEAT_RISE_SECONDS = 0.6;
const HEAT_COOL_SECONDS = 1.2;

const COUNTER_CLASSES =
  "flex font-sans font-bold uppercase leading-none tracking-tight tabular-nums " +
  "text-[length:clamp(3.5rem,13vw,11rem)] [--heat:0] " +
  "text-[color:color-mix(in_oklab,var(--color-cherry)_calc(var(--heat)*100%),var(--color-blueberry))]";

// Odometer rule: a wheel turns only while every wheel to its right rolls from 9 to 0.
function wheelPositions(value: number): number[] {
  const ones = value % 10;
  const carry = Math.max(0, ones - 9);
  const tensIndex = Math.floor(value / 10) % 10;
  const tens = tensIndex + carry;
  const hundreds = (Math.floor(value / 100) % 10) + (tensIndex === 9 ? carry : 0);
  return [hundreds, tens, ones];
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

        const wheels = gsap.utils.toArray<HTMLElement>("[data-wheel]", counterEl);
        const setWheelY = wheels.map((wheel) => gsap.quickSetter(wheel, "yPercent"));
        const renderWheels = (value: number) => {
          wheelPositions(value).forEach((position, index) => {
            setWheelY[index](-(position / DIGIT_CELLS.length) * 100);
          });
        };

        const heat = { value: 0 };
        const clampHeat = gsap.utils.clamp(0, 1);
        const renderHeat = () => counterEl.style.setProperty("--heat", String(heat.value));
        const heatTo = (target: number, duration: number) => {
          gsap.to(heat, { value: target, duration, ease: "power2.out", overwrite: true, onUpdate: renderHeat });
        };
        const coolDown = () => heatTo(0, HEAT_COOL_SECONDS);

        const progress = { value: JAR_FIRST };
        renderWheels(JAR_FIRST);

        gsap
          .timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "+=375%",
              pin: true,
              scrub: 1.2,
              onUpdate: (self) => {
                const target = clampHeat(Math.abs(self.getVelocity()) / HEAT_FULL_VELOCITY);
                heatTo(target, target > heat.value ? HEAT_RISE_SECONDS : HEAT_COOL_SECONDS);
              },
            },
          })
          .to(
            progress,
            { value: JAR_LAST, duration: 2, ease: "none", onUpdate: () => renderWheels(progress.value) },
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
            { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.04 },
            2.2,
          );

        ScrollTrigger.addEventListener("scrollEnd", coolDown);
        return () => {
          ScrollTrigger.removeEventListener("scrollEnd", coolDown);
          counterEl.style.removeProperty("--heat");
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
      className="relative h-svh overflow-hidden bg-purple"
    >
      <h2 id="party-title" className="sr-only">
        Fruit party
      </h2>
      <div aria-hidden="true" className="absolute inset-0 rounded-t-[2.5rem] bg-vanilla" />

      <p className="absolute bottom-6 left-6 z-20 text-sm font-medium text-blueberry">brut 2026</p>

      <div
        data-counter-wrap
        className="invisible absolute inset-0 flex flex-col items-center justify-center gap-3"
      >
        <p className="text-sm font-medium lowercase tracking-tight text-pink">now filling</p>
        <p ref={counterRef} aria-hidden="true" className={COUNTER_CLASSES}>
          <span>Jar-</span>
          {WHEEL_KEYS.map((key) => (
            <span key={key} className="inline-block h-[1em] overflow-hidden">
              <span data-wheel className="flex flex-col will-change-transform">
                {DIGIT_CELLS.map((digit, index) => (
                  <span key={index} className="h-[1em]">
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          ))}
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
