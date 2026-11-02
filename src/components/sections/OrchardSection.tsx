"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Position = readonly [number, number];

type Layer = {
  id: "1" | "2" | "3";
  word: string;
  containerClasses: string;
  classes: string;
  blurClasses: string;
  positions: readonly Position[];
};

const WORD_CLASSES = "font-sans font-bold uppercase leading-none tracking-tight";
const CLOUD_TEXT_CLASSES =
  "block text-white [text-shadow:0_0_6px_rgb(255_255_255/0.9),0_0_18px_rgb(255_255_255/0.7),0_0_36px_rgb(255_255_255/0.5)]";
const MAX_SKEW_DEG = 20;
const SKEW_VELOCITY_DIVISOR = -300;

const LAYERS: readonly Layer[] = [
  {
    id: "1",
    word: "Leaf",
    containerClasses: "opacity-50",
    classes: "text-[clamp(0.75rem,1.2vw,1rem)]",
    blurClasses: "blur-[1.5px]",
    positions: [
      [6, 14],
      [28, 22],
      [52, 10],
      [74, 18],
      [96, 12],
      [118, 24],
      [140, 16],
      [162, 20],
    ],
  },
  {
    id: "2",
    word: "Leaf",
    containerClasses: "opacity-75",
    classes: "text-[clamp(1rem,1.8vw,1.5rem)]",
    blurClasses: "blur-[0.8px]",
    positions: [
      [12, 70],
      [34, 82],
      [58, 74],
      [80, 86],
      [104, 72],
      [126, 84],
      [150, 76],
      [172, 88],
    ],
  },
  {
    id: "3",
    word: "Plum",
    containerClasses: "",
    classes: "text-[clamp(1.25rem,2.6vw,2.25rem)]",
    blurClasses: "blur-[0.3px]",
    positions: [
      [4, 36],
      [22, 58],
      [46, 30],
      [66, 64],
      [88, 38],
      [110, 60],
      [132, 32],
      [156, 62],
    ],
  },
];

export default function OrchardSection() {
  const rootRef = useRef<HTMLElement>(null);
  const pearRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const pear = pearRef.current;
        if (!pear) return;
        const clampSkew = gsap.utils.clamp(-MAX_SKEW_DEG, MAX_SKEW_DEG);
        const setPearSkew = gsap.quickSetter(pear, "skewX", "deg");
        const skew = { value: 0 };
        gsap.set(pear, { transformOrigin: "center center", force3D: true });

        gsap
          .timeline()
          .from("[data-word]", {
            autoAlpha: 0,
            y: 24,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.015,
          })
          .from(
            "[data-pear]",
            { autoAlpha: 0, yPercent: 40, duration: 1, ease: "power4.out" },
            0.1,
          );

        gsap.to("[data-float]", {
          x: "random(-8, 8)",
          y: "random(-12, 12)",
          duration: "random(3, 6)",
          ease: "sine.inOut",
          repeat: -1,
          repeatRefresh: true,
          delay: "random(0, 2)",
        });

        const scroll = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1.2,
            onUpdate: (self) => {
              const target = clampSkew(self.getVelocity() / SKEW_VELOCITY_DIVISOR);
              if (Math.abs(target) > Math.abs(skew.value)) {
                skew.value = target;
                gsap.to(skew, {
                  value: 0,
                  duration: 1.6,
                  ease: "power3",
                  overwrite: true,
                  onUpdate: () => setPearSkew(skew.value),
                });
              }
            },
          },
        });
        scroll
          .to("[data-layer='1']", { x: "-20vw", ease: "none", duration: 1 }, 0)
          .to("[data-layer='2']", { x: "-45vw", ease: "none", duration: 1 }, 0)
          .to("[data-layer='3']", { x: "-80vw", ease: "none", duration: 1 }, 0)
          .to("[data-hint]", { autoAlpha: 0, ease: "none", duration: 0.1 }, 0);
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="orchard-title"
      className="relative h-svh overflow-hidden bg-linear-to-b from-sky-deep to-sky-soft"
    >
      <h2 id="orchard-title" className="sr-only">
        Orchard
      </h2>
      <p className="absolute left-6 top-6 z-20 text-2xl font-bold lowercase tracking-tight text-white">
        brut
      </p>
      <div aria-hidden="true" className="absolute inset-0">
        {LAYERS.map((layer) => (
          <div
            key={layer.id}
            data-layer={layer.id}
            className={`absolute inset-0 ${layer.containerClasses}`.trim()}
          >
            {layer.positions.map(([x, y]) => (
              <span
                key={`${x}-${y}`}
                data-word
                className="absolute"
                style={{ left: `${x}vw`, top: `${y}%` }}
              >
                <span data-float className={`${CLOUD_TEXT_CLASSES} ${WORD_CLASSES} ${layer.classes} ${layer.blurClasses}`}>
                  {layer.word}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <p
          ref={pearRef}
          data-pear
          className={`text-white [text-shadow:0_6px_40px_rgb(255_255_255/0.55)] text-[clamp(4rem,14vw,12rem)] ${WORD_CLASSES}`}
        >
          Pear
        </p>
      </div>
      <p
        data-hint
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 z-20 text-center text-2xl text-white/80"
      >
        {"\u2193"}
      </p>
    </section>
  );
}
