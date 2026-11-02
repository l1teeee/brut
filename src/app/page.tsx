import GrainOverlay from "@/components/GrainOverlay";
import Loader from "@/components/Loader";
import ConveyorSection from "@/components/sections/ConveyorSection";
import CounterSection from "@/components/sections/CounterSection";
import OrchardSection from "@/components/sections/OrchardSection";
import SignsSection from "@/components/sections/SignsSection";
import ScrollIndicator from "@/components/ScrollIndicator";
import ScrollSound from "@/components/ScrollSound";
import SmoothScroll from "@/components/SmoothScroll";
import SoundToggle from "@/components/SoundToggle";

export default function Home() {
  return (
    <>
      <SmoothScroll>
        <main>
          <OrchardSection />
          <SignsSection />
          <ConveyorSection />
          <CounterSection />
        </main>
      </SmoothScroll>
      <GrainOverlay />
      <ScrollSound />
      <SoundToggle />
      <ScrollIndicator />
      <Loader />
    </>
  );
}
