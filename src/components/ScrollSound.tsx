"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { getSoundEngine } from "@/lib/sound-engine";

const SCROLL_FULL_SPEED = 2500;

export default function ScrollSound() {
  useEffect(() => {
    const sound = getSoundEngine();
    let lastY = window.scrollY;
    const onTick = (_time: number, deltaTime: number) => {
      const speed = Math.abs(window.scrollY - lastY) / (deltaTime / 1000);
      lastY = window.scrollY;
      sound.setScrollIntensity(speed / SCROLL_FULL_SPEED);
    };
    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
      sound.setScrollIntensity(0);
    };
  }, []);

  return null;
}
