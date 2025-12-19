import HeroSection from "@/components/dashboard/hero-section";
import Header from "@/components/header/header";

export default function Home() {
  return (
    <>
    <Header />
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <HeroSection />
    </div>
    </>
  );
}
