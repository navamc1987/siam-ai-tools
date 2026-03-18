/*
 * Design: GitHub-Inspired Minimalist Contact
 * - Pure white background with subtle gray borders
 * - Clean cards for team members, structured form
 */
import { useEffect, useRef, useState } from "react";
import { Phone, MapPin, Clock, ExternalLink, User, ShieldCheck, Briefcase, Mail, Send } from "lucide-react";

const teamContacts = [
  {
    name: "คุณวัชรพงศ์ (บอล)",
    role: "เซลล์โปรเจค",
    phone: "081-079-3266",
    area: "กรุงเทพฯ, ปริมณฑล, ชลบุรี, ระยอง, นครสวรรค์",
    icon: Briefcase,
  },
  {
    name: "คุณวุฒิชัย (ช่างแวน)",
    role: "ช่างติดตั้ง",
    phone: "084-973-7099",
    area: "เฉพาะพื้นที่กรุงเทพฯ และปริมณฑล",
    icon: ShieldCheck,
  },
  {
    name: "คุณปกรณ์ (ปอนด์)",
    role: "เซลล์โปรเจค",
    phone: "097-083-9445",
    area: "เฉพาะพื้นที่กรุงเทพฯ",
    icon: User,
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1f2328] mb-4">ติดต่อเรา</h2>
          <p className="text-[#656d76] text-lg">
            เราพร้อมให้คำปรึกษาและบริการคุณด้วยทีมงานมืออาชีพ ติดต่อหาเราได้ทันทีผ่านช่องทางที่คุณสะดวก
          </p>
        </div>

        {/* Team Contacts Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {teamContacts.map((person, i) => (
            <div 
              key={i} 
              className="bg-[#f6f8fa] border border-[#d0d7de] rounded-lg p-8 hover:border-[#0969da] transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-white border border-[#d0d7de] flex items-center justify-center group-hover:border-[#0969da] transition-all">
                  <person.icon className="w-6 h-6 text-[#1f2328] group-hover:text-[#0969da]" />
                </div>
                <div>
                  <h4 className="text-[#1f2328] font-bold text-lg leading-tight">{person.name}</h4>
                  <p className="text-[#656d76] text-xs font-semibold uppercase tracking-wider mt-1">{person.role}</p>
                </div>
              </div>
              <div className="space-y-4">
                <a 
                  href={`tel:${person.phone.replace(/-/g, '')}`} 
                  className="flex items-center gap-3 text-[#1f2328] hover:text-[#0969da] font-bold text-xl transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#0969da]" />
                  {person.phone}
                </a>
                <div className="flex items-start gap-3 text-[#656d76] text-sm">
                  <MapPin className="w-5 h-5 text-[#0969da] mt-0.5 shrink-0" />
                  <span>{person.area}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <div className="space-y-10">
            <div>
              <h4 className="text-2xl font-bold text-[#1f2328] mb-6">สำนักงานใหญ่</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1f2328]" />
                  </div>
                  <div>
                    <p className="text-[#1f2328] font-semibold mb-1">ที่อยู่</p>
                    <p className="text-[#656d76] text-sm leading-relaxed">
                      567/65 หมู่ที่ 4 ต.เขาคันทรง อ.ศรีราชา จ.ชลบุรี 20110
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#1f2328]" />
                  </div>
                  <div>
                    <p className="text-[#1f2328] font-semibold mb-1">เวลาทำการ</p>
                    <p className="text-[#656d76] text-sm">จันทร์ – เสาร์: 08:00 – 17:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-[#d0d7de] h-72 grayscale-[0.2] hover:grayscale-0 transition-all">
              <iframe
                title="แผนที่"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3884.7!2d101.0!3d13.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzAwLjAiTiAxMDHCsDAwJzAwLjAiRQ!5e0!3m2!1sth!2sth!4v1234567890"
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy"
              />
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-10 shadow-sm">
            <h4 className="text-2xl font-bold text-[#1f2328] mb-2">ส่งข้อความหาเรา</h4>
            <p className="text-[#656d76] text-sm mb-8">กรอกข้อมูลด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด</p>
            
            {submitted && (
              <div className="bg-[#dafbe1] border border-[#4ac26b] rounded-md p-4 mb-8 text-[#1a7f37] text-sm font-bold flex items-center gap-2">
                ✅ ส่งข้อความสำเร็จ! เราจะติดต่อกลับหาคุณโดยเร็วที่สุด
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[#1f2328] text-sm font-bold block mb-2">ชื่อ-นามสกุล</label>
                  <input type="text" required placeholder="John Doe" className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all" />
                </div>
                <div>
                  <label className="text-[#1f2328] text-sm font-bold block mb-2">อีเมล</label>
                  <input type="email" required placeholder="example@email.com" className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[#1f2328] text-sm font-bold block mb-2">เบอร์โทรศัพท์</label>
                <input type="tel" required placeholder="081-XXX-XXXX" className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all" />
              </div>
              <div>
                <label className="text-[#1f2328] text-sm font-bold block mb-2">ข้อความ / รายละเอียดงาน</label>
                <textarea rows={4} placeholder="อธิบายรายละเอียดที่คุณต้องการ..." className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all resize-none" />
              </div>
              <button type="submit" className="btn-blue w-full py-4 text-base flex items-center justify-center gap-2">
                ส่งข้อความ <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
