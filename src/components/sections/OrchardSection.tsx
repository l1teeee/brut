"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Position = readonly [number, number];

type Layer = {
  id: "1" | "2" | "3";
  word: string;
  containerClasses: string;
  classes: string;
  positions: readonly Position[];
};

const WORD_CLASSES = "font-sans font-bold uppercase leading-none tracking-tight";

const LAYERS: readonly Layer[] = [
  {
    id: "1",
    word: "Leaf",
    containerClasses: "opacity-70",
    classes: "text-sage text-[clamp(0.75rem,1.2vw,1rem)]",
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
    containerClasses: "",
    classes: "text-sage text-[clamp(1rem,1.8vw,1.5rem)]",
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
    classes: "text-plum text-[clamp(1.25rem,2.6vw,2.25rem)]",
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

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
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

        const scroll = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 0.6,
          },
        });
        scroll
          .to("[data-layer='1']", { x: "-20vw", ease: "none", duration: 1 }, 0)
          .to("[data-layer='2']", { x: "-45vw", ease: "none", duration: 1 }, 0)
          .to("[data-layer='3']", { x: "-80vw", ease: "none", duration: 1 }, 0)
          .fromTo(
            "[data-pear]",
            { rotation: -6, scale: 1 },
            { rotation: 6, scale: 1.12, ease: "none", duration: 1 },
            0,
          )
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
      className="relative h-svh overflow-hidden bg-dusty-blue"
    >
      <h2 id="orchard-title" className="sr-only">
        Orchard
      </h2>
      <p className="absolute left-6 top-6 z-20 text-2xl font-bold lowercase tracking-tight text-honey">
        brut
      </p>
      <p className="absolute right-6 top-6 z-20 text-sm font-medium text-sage">
        01 / orchard
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
                className={`absolute ${WORD_CLASSES} ${layer.classes}`}
                style={{ left: `${x}vw`, top: `${y}%` }}
              >
                {layer.word}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <p
          data-pear
          className={`text-honey text-[clamp(4rem,14vw,12rem)] ${WORD_CLASSES}`}
        >
          Pear
        </p>
      </div>
      <p
        data-hint
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 z-20 text-center text-2xl text-honey"
      >
        {"\u2193"}
      </p>
    </section>
  );
}
