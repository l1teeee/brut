"use client";

import { useSyncExternalStore } from "react";
import { getSoundEngine } from "@/lib/sound-engine";

const subscribeToSound = (listener: () => void) => getSoundEngine().subscribe(listener);
const readSoundEnabled = () => getSoundEngine().isEnabled();

export default function SoundToggle() {
  const enabled = useSyncExternalStore(subscribeToSound, readSoundEnabled, () => false);

  return (
    <button
      type="button"
      data-sound-toggle
      aria-pressed={enabled}
      onClick={() => getSoundEngine().toggle()}
      className="fixed right-6 top-6 z-50 text-sm font-medium lowercase tracking-tight text-white mix-blend-difference"
    >
      {enabled ? "sound on" : "sound off"}
    </button>
  );
}
