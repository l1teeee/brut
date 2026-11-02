import ConveyorSection from "@/components/sections/ConveyorSection";
import CounterSection from "@/components/sections/CounterSection";
import OrchardSection from "@/components/sections/OrchardSection";
import SignsSection from "@/components/sections/SignsSection";

export default function Home() {
  return (
    <main>
      <OrchardSection />
      <SignsSection />
      <ConveyorSection />
      <CounterSection />
    </main>
  );
}
