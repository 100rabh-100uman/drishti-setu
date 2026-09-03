import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CapabilitiesSection } from "@/components/home/CapabilitiesSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafcff]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CapabilitiesSection />
      </main>
      <Footer />
    </div>
  );
}
