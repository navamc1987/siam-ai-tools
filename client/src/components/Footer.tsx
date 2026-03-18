/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Dark footer with gold accents, company info, quick links
 */
import { Zap, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0a0a18] border-t border-[#C9A84C]/20">
      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-sm bg-[#C9A84C] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#1A1A2E]" fill="currentColor" />
              </div>
              <div>
                <p className="text-[#C9A84C] font-bold text-sm">สยาม เอไอ ทูลส์</p>
                <p className="text-white/40 text-[10px] tracking-widest uppercase">Siam AI Tools</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์<br />
              เลขทะเบียน: 0203568004052
            </p>
            <p className="text-white/40 text-xs">
              ผู้เชี่ยวชาญด้านระบบไฟฟ้า เทคโนโลยี<br />
              และโปรแกรมบริหารจัดการองค์กร
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm tracking-wide mb-4 uppercase">
              เมนูหลัก
            </h4>
            <ul className="space-y-2">
              {[
                { label: "หน้าแรก", href: "#home" },
                { label: "เกี่ยวกับเรา", href: "#about" },
                { label: "บริการ", href: "#services" },
                { label: "ติดต่อเรา", href: "#contact" },
              ].map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-white/50 hover:text-[#C9A84C] text-sm transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm tracking-wide mb-4 uppercase">
              ติดต่อ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                <a href="tel:0810793266" className="text-white/50 hover:text-[#C9A84C] text-sm transition-colors">
                  081-079-3266
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-white/50 text-sm">
                  567/65 หมู่ที่ 4 ต.เขาคันทรง<br />
                  อ.ศรีราชา จ.ชลบุรี 20110
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-white/50 text-sm">
                  จันทร์ – เสาร์: 08:00 – 17:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#C9A84C]/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์. สงวนลิขสิทธิ์.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-white/30 text-xs">พร้อมให้บริการ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
