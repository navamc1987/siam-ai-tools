/*
 * Design: GitHub-Inspired Minimalist Hero
 * - Clean white background with subtle dot pattern
 * - Left-aligned text, high contrast, focused CTAs
 */
import { useEffect, useState } from "react";
import { ChevronDown, Phone, MapPin, ExternalLink } from "lucide-react";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

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
      className="relative min-h-[60vh] flex items-center pt-12 pb-16 bg-white overflow-hidden"
    >
      {/* Subtle Dot Pattern Background */}
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      
      {/* Decorative gradient blur (Minimalist touch) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-full px-4 py-1.5 mb-4 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0969da]" />
            <span className="text-[#1f2328] text-xs font-semibold tracking-wide uppercase">
              ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์
            </span>
          </div>

          {/* Main heading (Significantly reduced for Minimalist look) */}
          <h1
            className={`text-2xl md:text-3xl lg:text-4xl font-bold text-[#1f2328] leading-tight mb-4 transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            ต่อเติม รีโนเวท และงานระบบ <span className="text-[#0969da]">ที่เรียบง่าย</span>
          </h1>

          {/* Description (Reduced to standard reading size) */}
          <div className="flex justify-center">
            <p
              className={`text-[#656d76] text-sm md:text-base leading-relaxed mb-10 max-w-2xl transition-all duration-700 delay-200 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              ผู้เชี่ยวชาญด้านการออกแบบ ติดตั้ง และซ่อมบำรุง งานต่อเติมและรีโนเวทห้องต่างๆ
              หลังคา โรงจอดรถ พร้อมบริการระบบไฟฟ้า แสงสว่าง เครือข่าย CCTV
              และโปรแกรมบริหารจัดการองค์กร ERPNext
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <button
              onClick={() => {
                const el = document.querySelector("#products");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-primary px-8 py-3 text-base"
            >
              ดูบริการและสินค้า
            </button>
            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-secondary px-8 py-3 text-base flex items-center gap-2"
            >
              ติดต่อเรา <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Quick info */}
          <div
            className={`flex flex-wrap items-center justify-center gap-8 border-t border-[#d0d7de] pt-10 transition-all duration-700 delay-400 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <a
              href="tel:0985926522"
              className="flex items-center gap-2 text-[#1f2328] hover:text-[#0969da] font-semibold transition-colors"
            >
              <Phone className="w-5 h-5 text-[#0969da]" />
              098-592-6522
            </a>
            <div className="flex items-center gap-2 text-[#656d76]">
              <MapPin className="w-5 h-5 text-[#0969da] shrink-0" />
              <span className="font-medium">กรุงเทพฯ | สมุทรปราการ | ชลบุรี | ระยอง | กลางเหนือตอนล่าง</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScroll}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#d0d7de] hover:text-[#0969da] transition-colors animate-bounce hidden md:block"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-10 h-10" />
      </button>
    </section>
  );
}
