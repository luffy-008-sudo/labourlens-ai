import HeroSection from "@/components/HeroSection";
import BentoFeaturesSection from "@/components/BentoFeaturesSection";

export default function HeroPage() {
  return (
    <div className="w-full space-y-6">
      <HeroSection />
      <BentoFeaturesSection />
    </div>
  );
}
