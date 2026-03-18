/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Services section with card grid, gold top-border hover effect
 * Service images, icons, and descriptions
 */
import { useEffect, useRef, useState } from "react";
import { Zap, Lightbulb, Settings, Monitor, Camera, Database } from "lucide-react";

const ELECTRICAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450220945/2xv2kDRJAu53CHYeiRqts8/electrical-service-ZKdAWD8RMhAFsoeBaEkhBf.webp";
const CCTV_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450220945/2xv2kDRJAu53CHYeiRqts8/cctv-service-3a6SfXtCtR6HSNqTwdAZ8R.webp";
const ERP_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450220945/2xv2kDRJAu53CHYeiRqts8/erp-software-YNwoN8QEA9gjn2VPLv2xVd.webp";

const services = [
  {
    icon: Zap,
    title: "ระบบไฟฟ้า",
    subtitle: "Electrical Systems",
    description:
      "ออกแบบ ติดตั้ง และซ่อมบำรุงระบบไฟฟ้าในอาคารและโรงงานอุตสาหกรรม ครอบคลุมระบบแรงสูงและแรงต่ำ ตู้ MDB, DB และระบบสายดิน",
    image: ELECTRICAL_IMAGE,
    features: ["ระบบไฟฟ้าแรงสูง-แรงต่ำ", "ตู้ควบคุมไฟฟ้า MDB/DB", "ระบบสายดิน", "ซ่อมบำรุงเชิงป้องกัน"],
  },
  {
    icon: Lightbulb,
    title: "ระบบแสงสว่าง",
    subtitle: "Lighting Systems",
    description:
      "ออกแบบและติดตั้งระบบแสงสว่างประสิทธิภาพสูง ทั้งภายในและภายนอกอาคาร รวมถึงระบบ Smart Lighting ประหยัดพลังงาน",
    image: null,
    features: ["LED ประสิทธิภาพสูง", "Smart Lighting", "ระบบแสงสว่างฉุกเฉิน", "ออกแบบตามมาตรฐาน"],
  },
  {
    icon: Settings,
    title: "ระบบควบคุมไฟฟ้า",
    subtitle: "Building Automation",
    description:
      "ติดตั้งระบบควบคุมไฟฟ้าอัตโนมัติในอาคารและโรงงาน ระบบ BMS, SCADA และ PLC สำหรับควบคุมกระบวนการผลิต",
    image: null,
    features: ["BMS Building Management", "SCADA System", "PLC Programming", "ระบบ Automation"],
  },
  {
    icon: Monitor,
    title: "คอมพิวเตอร์และเครือข่าย",
    subtitle: "Computer & Network",
    description:
      "จำหน่าย ติดตั้ง และซ่อมบำรุงระบบคอมพิวเตอร์ เครือข่าย LAN/WAN และระบบ Server สำหรับองค์กร",
    image: null,
    features: ["ติดตั้งระบบเครือข่าย", "Server & Storage", "ซ่อมบำรุงคอมพิวเตอร์", "IT Support"],
  },
  {
    icon: Camera,
    title: "กล้องวงจรปิด",
    subtitle: "CCTV Systems",
    description:
      "ออกแบบและติดตั้งระบบกล้องวงจรปิด IP Camera และ Analog ความละเอียดสูง พร้อมระบบบันทึกและ Remote Monitoring",
    image: CCTV_IMAGE,
    features: ["IP Camera HD/4K", "NVR/DVR Recording", "Remote Monitoring", "AI Analytics"],
  },
  {
    icon: Database,
    title: "โปรแกรม ERPNEXT",
    subtitle: "ERP Software",
    description:
      "ติดตั้ง ปรับแต่ง และฝึกอบรมการใช้งานโปรแกรม ERPNext ระบบบริหารจัดการองค์กรครบวงจร สำหรับธุรกิจทุกขนาด",
    image: ERP_IMAGE,
    features: ["การเงินและบัญชี", "บริหารสินค้าคงคลัง", "ระบบ HR & Payroll", "Manufacturing Module"],
  },
];

function useInView(threshold = 0.1) {
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

export default function ServicesSection() {
  const { ref, inView } = useInView();

  return (
    <section id="services" className="py-20 md:py-28 bg-[#0f0f1e] relative overflow-hidden">
      {/* Hex pattern */}
      <div className="absolute inset-0 hex-pattern opacity-30" />

      <div className="container relative z-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-0.5 bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            บริการของเรา
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              บริการครบวงจร
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-[#C9A84C] mt-1">
              ด้านไฟฟ้าและเทคโนโลยี
            </h3>
          </div>
          <p className="text-white/50 text-sm max-w-sm text-right hidden md:block">
            เราให้บริการครอบคลุมทุกความต้องการ<br />
            ด้านระบบไฟฟ้าและเทคโนโลยีสารสนเทศ
          </p>
        </div>

        {/* Services grid */}
        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className={`service-card rounded-sm overflow-hidden transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Service image (if available) */}
              {service.image && (
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18182e] via-transparent to-transparent" />
                </div>
              )}

              {/* No image: show icon background */}
              {!service.image && (
                <div className="h-28 bg-gradient-to-br from-[#C9A84C]/10 to-[#0f0f1e] flex items-center justify-center">
                  <service.icon className="w-12 h-12 text-[#C9A84C]/40" />
                </div>
              )}

              <div className="p-6">
                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center shrink-0">
                    <service.icon className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{service.title}</h3>
                    <p className="text-[#C9A84C]/70 text-xs tracking-wide">{service.subtitle}</p>
                  </div>
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-4">{service.description}</p>

                {/* Features list */}
                <ul className="space-y-1.5">
                  {service.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-white/50 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
