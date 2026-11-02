"use client";

import { useEffect } from "react";
import { subscribeScrollSpeed } from "@/lib/scroll-speed";
import { getSoundEngine } from "@/lib/sound-engine";

const SCROLL_FULL_SPEED = 2500;

export default function ScrollSound() {
  useEffect(() => {
    const sound = getSoundEngine();
    const unsubscribe = subscribeScrollSpeed((speed) => sound.setScrollIntensity(speed / SCROLL_FULL_SPEED));
    return () => {
      unsubscribe();
      sound.setScrollIntensity(0);
    };
  }, []);

  return null;
}
