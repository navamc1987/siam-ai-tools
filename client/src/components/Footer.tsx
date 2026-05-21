/*
 * Design: GitHub-Inspired Minimalist Footer
 * - Pure white background with clean top border
 * - Simple text links, structured company info
 */
import { Phone, MapPin, Clock, Github, Facebook, LineChart } from "lucide-react";

export default function Footer() {
  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-[#d0d7de] pt-16 pb-8">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#0969da] flex items-center justify-center">
                <img src="/sat-mark.svg" alt="SAT" className="w-5 h-5" />
              </div>
              <p className="text-[#1f2328] font-bold text-lg">SAT</p>
            </div>
            <p className="text-[#656d76] text-sm leading-relaxed mb-6">
              มุ่งมั่นส่งมอบบริการต่อเติม รีโนเวท และเทคโนโลยีที่ทันสมัย เพื่อปรับปรุงคุณภาพชีวิตและธุรกิจไทยอย่างยั่งยืน
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#656d76] hover:text-[#0969da] transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-[#656d76] hover:text-[#0969da] transition-colors"><LineChart className="w-5 h-5" /></a>
              <a href="#" className="text-[#656d76] hover:text-[#0969da] transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#1f2328] font-bold text-sm mb-6 uppercase tracking-wider">เมนูหลัก</h4>
            <ul className="space-y-4">
              {[
                { label: "หน้าแรก", href: "#home" },
                { label: "บริการและสินค้า", href: "#products" },
                { label: "ติดต่อเรา", href: "#contact" },
              ].map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-[#656d76] hover:text-[#0969da] text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#1f2328] font-bold text-sm mb-6 uppercase tracking-wider">บริการของเรา</h4>
            <ul className="space-y-4">
              {["ต่อเติมและรีโนเวท", "ระบบไฟฟ้า", "CCTV & Security"].map((service) => (
                <li key={service}>
                  <span className="text-[#656d76] text-sm font-medium">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[#1f2328] font-bold text-sm mb-6 uppercase tracking-wider">ติดต่อ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0969da] mt-1 shrink-0" />
                <a href="tel:0810793266" className="text-[#656d76] hover:text-[#0969da] text-sm font-medium transition-colors">
                  081-079-3266
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0969da] mt-1 shrink-0" />
                <span className="text-[#656d76] text-sm leading-relaxed">
                  567/65 หมู่ที่ 4 ต.เขาคันทรง อ.ศรีราชา จ.ชลบุรี 20110
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#d0d7de] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#656d76] text-xs">
            © {new Date().getFullYear()} ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
