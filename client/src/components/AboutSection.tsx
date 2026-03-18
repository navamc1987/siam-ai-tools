/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * About section with team image, company info, stats counters
 * Gold accent lines, asymmetric layout
 */
import { useEffect, useRef, useState } from "react";
import { Award, Users, Wrench, Building2 } from "lucide-react";

const ABOUT_IMAGE = "/images/about/team-photo.jpg";

const stats = [
  { icon: Award, value: "10+", label: "ปีประสบการณ์" },
  { icon: Building2, value: "200+", label: "โครงการที่สำเร็จ" },
  { icon: Users, value: "50+", label: "ลูกค้าที่ไว้วางใจ" },
  { icon: Wrench, value: "เร็วที่สุด 1-3 วัน", label: "บริการซ่อมบำรุง" },
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function AboutSection() {
  const { ref, inView } = useInView();

  return (
    <section id="about" className="py-20 md:py-28 bg-[#1A1A2E] relative overflow-hidden">
      {/* Hex pattern */}
      <div className="absolute inset-0 hex-pattern opacity-50" />

      <div className="container relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-0.5 bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            เกี่ยวกับเรา
          </span>
        </div>

        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <div
            className={`relative transition-all duration-700 ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="relative">
              <img
                src={ABOUT_IMAGE}
                alt="ทีมงาน สยาม เอไอ ทูลส์"
                className="w-full rounded-sm object-cover aspect-[4/5] lg:aspect-auto max-h-[600px]"
              />
              {/* Gold border accent */}
              <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-[#C9A84C]/30 rounded-sm pointer-events-none" />
              {/* Company badge */}
              <div className="absolute -top-4 -left-4 bg-[#C9A84C] text-[#1A1A2E] px-4 py-2 rounded-sm shadow-lg">
                <p className="font-bold text-xs leading-tight">ผู้เชี่ยวชาญมีประสบการณ์กว่า</p>
                <p className="font-display text-2xl leading-none">20 ปี</p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              ห้างหุ้นส่วนจำกัด
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-[#C9A84C] mb-6">
              สยาม เอไอ ทูลส์
            </h3>
            <div className="w-16 h-0.5 bg-[#C9A84C] mb-6" />

            <p className="text-white/70 text-base leading-relaxed mb-4">
              เราเป็นผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าและเทคโนโลยีสารสนเทศ
              ให้บริการครบวงจรตั้งแต่การออกแบบ ติดตั้ง ไปจนถึงการซ่อมบำรุง
              ระบบไฟฟ้าในอาคารและโรงงานอุตสาหกรรม
            </p>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              ด้วยทีมวิศวกรและช่างผู้มีประสบการณ์ เราพร้อมให้บริการลูกค้า
              ในเขตจังหวัดชลบุรีและพื้นที่ใกล้เคียงด้วยมาตรฐานสูงสุด
            </p>

            {/* Company info */}
            <div className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-5 mb-8">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-[#C9A84C] font-semibold w-28 shrink-0">TAX ID</span>
                  <span className="text-white/70">0203568004052</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#C9A84C] font-semibold w-28 shrink-0">ที่อยู่</span>
                  <span className="text-white/70">567/65 หมู่ที่ 4 ต.เขาคันทรง อ.ศรีราชา จ.ชลบุรี 20110</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#C9A84C] font-semibold w-28 shrink-0">Line ID</span>
                  <a href="https://line.me/ti/p/~0900072977" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C9A84C] transition-colors">0900072977</a>
                </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#C9A84C] font-semibold w-28 shrink-0">โทรเลย</span>
                  <span className="text-white/70">081-079-3266</span>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-gold px-7 py-3 rounded-sm font-bold text-sm tracking-wide"
            >
              ติดต่อเรา
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 transition-all duration-700 delay-400 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-6 text-center hover:border-[#C9A84C]/50 transition-colors"
            >
              <stat.icon className="w-6 h-6 text-[#C9A84C] mx-auto mb-3" />
              <div className="font-display text-4xl text-[#C9A84C] mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
