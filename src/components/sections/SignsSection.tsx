"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const SIGN_LABELS: readonly string[] = ["Ripe now", "Hand-cut", "Small batch"];

const JAR_INDEXES: readonly number[] = Array.from({ length: 30 }, (_, index) => index);

export default function SignsSection() {
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

        const signs = gsap.utils.toArray<HTMLElement>("[data-sign-on]", rootRef.current);
        signs.forEach((sign, index) => {
          timeline
            .to(sign, { opacity: 1, duration: 0.05 }, 0.2 + index)
            .to(sign, { opacity: 0.2, duration: 0.05 })
            .to(sign, { opacity: 1, duration: 0.05 })
            .to(sign, { opacity: 0.4, duration: 0.05 })
            .to(sign, { opacity: 1, duration: 0.1 });
        });

        timeline.to("[data-jar]", { opacity: 1, duration: 0.1, stagger: 0.1, ease: "none" }, 0);
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="kitchen-title"
      className="relative h-svh overflow-hidden bg-chocolate"
    >
      <h2 id="kitchen-title" className="sr-only">
        Kitchen
      </h2>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8vh] px-6">
        <div className="flex flex-wrap items-center justify-center gap-[4vw]">
          {SIGN_LABELS.map((label) => (
            <p
              key={label}
              className="relative font-sans font-bold uppercase leading-none tracking-tight text-[clamp(1.25rem,3.2vw,2.75rem)]"
            >
              <span className="block rounded-md border-2 border-olive px-[1em] py-[0.5em] text-olive">
                {label}
              </span>
              <span
                data-sign-on
                aria-hidden="true"
                className="absolute inset-0 block rounded-md border-2 border-apricot px-[1em] py-[0.5em] text-apricot opacity-0 shadow-[0_0_32px_rgb(229_134_95/0.35)] [text-shadow:0_0_24px_rgb(229_134_95/0.65)]"
              >
                {label}
              </span>
            </p>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="grid grid-cols-6 gap-x-[3vw] gap-y-[2vh] sm:grid-cols-10"
        >
          {JAR_INDEXES.map((index) => (
            <span
              key={index}
              data-jar
              className="font-sans font-bold uppercase leading-none tracking-tight text-vanilla opacity-20 text-[clamp(0.75rem,1.4vw,1.125rem)]"
            >
              Jar
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
