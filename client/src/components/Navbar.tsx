/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Dark charcoal navbar with gold accents, sticky positioning
 * Sarabun font for Thai text
 */
import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";

const navItems = [
  { label: "หน้าแรก", href: "#home" },
  { label: "เกี่ยวกับเรา", href: "#about" },
  { label: "บริการ", href: "#services" },
  { label: "สินค้า", href: "#products" },
  { label: "ติดต่อเรา", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f0f1e]/95 backdrop-blur-md shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-sm bg-[#C9A84C] flex items-center justify-center group-hover:bg-[#e0bb5e] transition-colors">
              <Zap className="w-5 h-5 text-[#1A1A2E]" fill="currentColor" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#C9A84C] font-bold text-sm tracking-wide">
                สยาม เอไอ ทูลส์
              </span>
              <span className="text-white/50 text-[10px] tracking-widest uppercase">
                Siam AI Tools
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="nav-link text-white/80 text-sm font-medium hover:text-[#C9A84C]"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-gold px-5 py-2 rounded-sm text-sm font-bold tracking-wide"
            >
              ติดต่อเรา
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/80 hover:text-[#C9A84C] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0f0f1e]/98 backdrop-blur-md border-t border-[#C9A84C]/20 px-4 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-left text-white/80 hover:text-[#C9A84C] py-3 px-2 text-base font-medium border-b border-white/5 last:border-0 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            className="btn-gold mt-3 py-3 rounded-sm text-sm font-bold tracking-wide"
          >
            ติดต่อเรา
          </button>
        </div>
      </div>
    </nav>
  );
}
