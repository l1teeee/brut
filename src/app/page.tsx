import GrainOverlay from "@/components/GrainOverlay";
import ConveyorSection from "@/components/sections/ConveyorSection";
import CounterSection from "@/components/sections/CounterSection";
import OrchardSection from "@/components/sections/OrchardSection";
import SignsSection from "@/components/sections/SignsSection";
import ScrollIndicator from "@/components/ScrollIndicator";
import SmoothScroll from "@/components/SmoothScroll";

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
      <ScrollIndicator />
    </>
  );
}
