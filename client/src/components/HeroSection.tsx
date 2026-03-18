/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Full-bleed hero with dark overlay, large typography, gold accents
 * Asymmetric text placement, scroll-triggered animations
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Phone, MapPin } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450220945/2xv2kDRJAu53CHYeiRqts8/hero-banner-jfbsdHioRwSL6VXowVxe8s.webp";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    const el = document.querySelector("#about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a18]/95 via-[#0a0a18]/80 to-[#0a0a18]/40" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1A1A2E] to-transparent" />

      {/* Decorative large background number */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 font-display text-[20rem] text-white/[0.02] select-none pointer-events-none leading-none hidden xl:block">
        01
      </div>

      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 rounded-sm px-4 py-1.5 mb-6 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
              ห้างหุ้นส่วนจำกัด
            </span>
          </div>

          {/* Main heading */}
          <h1
            className={`font-display text-5xl md:text-7xl lg:text-8xl text-white leading-none mb-2 transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            SIAM AI TOOLS
          </h1>
          <h2
            className={`text-2xl md:text-3xl font-bold text-[#C9A84C] mb-6 transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            สยาม เอไอ ทูลส์
          </h2>

          {/* Gold divider */}
          <div
            className={`w-24 h-0.5 bg-[#C9A84C] mb-6 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            } origin-left`}
          />

          {/* Description */}
          <p
            className={`text-white/75 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl transition-all duration-700 delay-400 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            ผู้เชี่ยวชาญด้านการออกแบบ ติดตั้ง และซ่อมบำรุง ระบบไฟฟ้า แสงสว่าง
            ระบบควบคุมไฟฟ้าในอาคารและโรงงานอุตสาหกรรม คอมพิวเตอร์
            กล้องวงจรปิด Fiber Optic LAN/WIFI และโปรแกรมสำเร็จรูป ERPNEXT
            บริการในพื้นที่ บรรพตพิสัย นครสวรรค์ ชลบุรี ศรีราชา
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-4 mb-10 transition-all duration-700 delay-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <button
              onClick={() => {
                const el = document.querySelector("#services");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-gold px-8 py-3.5 rounded-sm font-bold text-base tracking-wide"
            >
              ดูบริการของเรา
            </button>
            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-sm font-bold text-base tracking-wide border border-white/30 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              ติดต่อเรา
            </button>
          </div>

          {/* Quick info */}
          <div
            className={`flex flex-wrap gap-6 transition-all duration-700 delay-600 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <a
              href="tel:0810793266"
              className="flex items-center gap-2 text-white/60 hover:text-[#C9A84C] transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-[#C9A84C]" />
              081-079-3266
            </a>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>บรรพตพิสัย นครสวรรค์ | ศรีราชา ชลบุรี</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScroll}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-[#C9A84C] transition-colors animate-bounce z-10"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
