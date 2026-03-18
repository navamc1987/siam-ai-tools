/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Contact section with map placeholder, contact info cards
 * Dark background, gold accents
 */
import { useEffect, useRef, useState } from "react";
import { Phone, MapPin, Clock, ExternalLink } from "lucide-react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_82f17qc";
const TEMPLATE_CONTACT = "template_lpwp12s";
const TEMPLATE_AUTOREPLY = "template_k4mczze";
const PUBLIC_KEY = "Hrybri0n2ViF8KUzf";

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

const contactItems = [
  {
    icon: Phone,
    title: "โทรศัพท์",
    value: "081-079-3266",
    href: "tel:0810793266",
    sub: "โทรหาเราได้เลย",
  },
  {
    icon: MapPin,
    title: "ที่อยู่",
    value: "567/65 หมู่ที่ 4 ต.เขาคันทรง อ.ศรีราชา จ.ชลบุรี 20110",
    href: "https://maps.google.com/?q=567/65+หมู่ที่+4+ตำบลเขาคันทรง+อำเภอศรีราชา+ชลบุรี",
    sub: "เปิดใน Google Maps",
  },
  {
    icon: Clock,
    title: "เวลาทำการ",
    value: "จันทร์ – เสาร์: 08:00 – 17:00",
    href: null,
    sub: "พร้อมให้บริการ",
  },
];

export default function ContactSection() {
  const { ref, inView } = useInView();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      };
      await emailjs.send(SERVICE_ID, TEMPLATE_CONTACT, templateParams, PUBLIC_KEY);
      await emailjs.send(SERVICE_ID, TEMPLATE_AUTOREPLY, templateParams, PUBLIC_KEY);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-[#1A1A2E] relative overflow-hidden">
      <div className="absolute inset-0 hex-pattern opacity-30" />

      <div className="container relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-0.5 bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            ติดต่อเรา
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
          พร้อมให้บริการ
        </h2>
        <h3 className="text-xl md:text-2xl font-bold text-[#C9A84C] mb-12">
          ติดต่อเราได้เลยวันนี้
        </h3>

        <div ref={ref} className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact info + Map */}
          <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <div className="space-y-4 mb-8">
              {contactItems.map((item, i) => (
                <div key={i} className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-5 flex gap-4 hover:border-[#C9A84C]/50 transition-colors">
                  <div className="w-10 h-10 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-[#C9A84C] text-xs font-semibold tracking-wide mb-1">{item.title}</p>
                    {item.href ? (
                      
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-white font-medium text-sm hover:text-[#C9A84C] transition-colors flex items-start gap-1"
                      >
                        {item.value}
                        {item.href.startsWith("http") && <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />}
                      </a>
                    ) : (
                      <p className="text-white font-medium text-sm">{item.value}</p>
                    )}
                    <p className="text-white/40 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-sm overflow-hidden border border-[#C9A84C]/20 h-56">
              <iframe
                title="แผนที่ สยาม เอไอ ทูลส์"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3884.7!2d101.0!3d13.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzAwLjAiTiAxMDHCsDAwJzAwLjAiRQ!5e0!3m2!1sth!2sth!4v1234567890"
                width="100%" height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: Contact form */}
          <div className={`transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-8">
              <h4 className="text-white font-bold text-xl mb-2">ส่งข้อความหาเรา</h4>
              <p className="text-white/50 text-sm mb-6">กรอกข้อมูลด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด</p>

              {submitted && (
                <div className="bg-[#C9A84C]/15 border border-[#C9A84C]/40 rounded-sm p-4 mb-6 text-[#C9A84C] text-sm font-medium">
                  ✅ ขอบคุณที่ติดต่อเรา เราได้รับข้อความแล้ว และจะติดต่อกลับโดยเร็วที่สุดครับ/ค่ะ
                </div>
              )}

              {error && (
                <div className="bg-red-500/15 border border-red-500/40 rounded-sm p-4 mb-6 text-red-400 text-sm font-medium">
                  ❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    ชื่อ-นามสกุล <span className="text-[#C9A84C]">*</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                    className="w-full bg-[#1A1A2E] border border-[#C9A84C]/20 rounded-sm px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    อีเมล <span className="text-[#C9A84C]">*</span>
                  </label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="กรุณากรอกอีเมล"
                    className="w-full bg-[#1A1A2E] border border-[#C9A84C]/20 rounded-sm px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    เบอร์โทรศัพท์ <span className="text-[#C9A84C]">*</span>
                  </label>
                  <input
                    type="tel" required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="กรุณากรอกเบอร์โทรศัพท์"
                    className="w-full bg-[#1A1A2E] border border-[#C9A84C]/20 rounded-sm px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    ข้อความ / รายละเอียดงาน
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="กรุณาอธิบายงานที่ต้องการ..."
                    className="w-full bg-[#1A1A2E] border border-[#C9A84C]/20 rounded-sm px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/60 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3.5 rounded-sm font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "กำลังส่ง..." : "ส่งข้อความ"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
