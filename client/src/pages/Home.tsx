/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Main page assembling all sections
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedRenovationSection from "@/components/FeaturedRenovationSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import EstimatePromoSection from "@/components/EstimatePromoSection";
import CctvPromoSection from "@/components/CctvPromoSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <Navbar />
      <HeroSection />
      <FeaturedRenovationSection />
      <AboutSection />
      <ServicesSection />
      <ProductsSection />
      <CctvPromoSection />
      <EstimatePromoSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
