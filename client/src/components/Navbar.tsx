/*
 * Design: GitHub-Inspired Minimalist Navbar
 * - Sticky top with glass effect and clean border
 * - Minimalist brand identity, high readability
 */
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "หน้าแรก", href: "#home" },
    { label: "สินค้า", href: "#products" },
    { label: "ผลงานของเรา", href: "/portfolio" },
    { label: "ประเมินราคา", href: "/estimate" },
    { label: "ติดต่อเรา", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/")) {
      window.location.href = href;
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/${href}`;
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-[#d0d7de] py-3" : "bg-white py-5"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => handleNavClick("#home")}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-white ring-2 ring-[#0969da] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <div className="w-9 h-9 rounded-full ring-2 ring-[#C9A84C] bg-white overflow-hidden">
              <img src="/siamai-logo.png" alt="SAT" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-left">
            <p className="text-[#1f2328] font-bold text-lg leading-tight">SAT</p>
            <p className="text-[#656d76] text-[10px] font-bold tracking-widest uppercase">SIAM AI TOOLS</p>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-[#1f2328] font-semibold text-sm hover:text-[#0969da] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            className="btn-primary px-5 py-2 text-sm"
          >
            เริ่มโปรเจกต์ของคุณ
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#1f2328]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 top-[72px] bg-white z-40 transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="container py-10 flex flex-col gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-2xl font-bold text-[#1f2328] flex items-center justify-between group"
            >
              {link.label}
              <ChevronRight className="w-6 h-6 text-[#d0d7de] group-hover:text-[#0969da] transition-colors" />
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            className="btn-primary w-full py-4 text-lg mt-4"
          >
            ติดต่อเรา
          </button>
        </div>
      </div>
    </nav>
  );
}
