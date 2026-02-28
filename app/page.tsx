import { Footer } from "@/components/Footer";
import { CraftSection } from "@/components/sections/CraftSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { MeaningSection } from "@/components/sections/MeaningSection";
import { ProductConceptSection } from "@/components/sections/ProductConceptSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProductConceptSection />
      <CraftSection />
      <MeaningSection />
      <Footer />
    </main>
  );
}
