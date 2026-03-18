/*
 * Design: Bold Industrial + Thai Heritage Fusion
 * Products section with 3 product cards, images, details, and prices
 * Gold accent borders, dark background, Thai language
 */
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Star, Tag, CheckCircle, X } from "lucide-react";

const PRODUCT_1_IMAGE = "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80";
const PRODUCT_2_IMAGE = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80";
const PRODUCT_3_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80";
const PRODUCT_HIKVISION_IMAGE = "/images/products/hikvision-ip-1-4.png";
const PRODUCT_HIKVISION_5_8_IMAGE = "/images/products/hikvision-ip-5-8.png";
const PRODUCT_HIKVISION_9_16_IMAGE = "/images/products/hikvision-ip-9-16.png";
const SERVICE_FIBER_OPTIC_IMAGE = "/images/products/fiber-optic.jpg";
const SERVICE_LAN_WIFI_IMAGE = "/images/products/lan-wifi.webp";
const SERVICE_KNOCKDOWN_HOUSE_IMAGE = "/images/products/knockdown-house.jpg";
const SERVICE_BACKUP_RANSOMWARE_IMAGE = "/images/products/backup-ransomware.png";
const SERVICE_FIREWALL_IMAGE = "/images/products/firewall.png";
const SERVICE_ISO_27001_IMAGE = "/images/products/iso-27001.jpg";

const products = [
  {
    id: 9,
    image: SERVICE_FIBER_OPTIC_IMAGE,
    badge: "บริการใหม่",
    name: "บริการติดตั้ง Fiber Optic",
    nameEn: "Fiber Optic Installation Service",
    description:
      "บริการติดตั้งระบบ Fiber Optic ความเร็วสูง สำหรับอาคารและสำนักงาน ติดตั้งโดยช่างผู้เชี่ยวชาญ พร้อมการรับประกันและบริการหลังการขาย",
    features: [
      "ติดตั้งระบบ Fiber Optic ความเร็ว Gbps",
      "ออกแบบระบบเฉพาะตามความต้องการ",
      "ทดสอบและตรวจสอบคุณภาพ",
      "บริการซ่อมบำรุง เร็วที่สุด 1-3 วัน",
    ],
    price: "2,500",
    priceUnit: "บาท/จุด",
    originalPrice: "3,500",
    rating: 4.9,
    reviews: 32,
  },
  {
    id: 8,
    image: SERVICE_LAN_WIFI_IMAGE,
    badge: "บริการใหม่",
    name: "บริการเดินสาย LAN/WIFI",
    nameEn: "LAN/WIFI Cabling Service",
    description:
      "บริการเดินสายแลน LAN และติดตั้งระบบ WIFI ความเร็วสูง สำหรับบ้าน สำนักงาน และอาคารพาณิชย์ ด้วยมาตรฐานการติดตั้งสากล",
    features: [
      "เดินสาย LAN Cat6/Cat6A",
      "ติดตั้ง Access Point WIFI 6",
      "ออกแบบระบบเครือข่ายเหมาะสม",
      "ทดสอบและปรับแต่งสัญญาณ",
    ],
    price: "2,500",
    priceUnit: "บาท/จุด",
    originalPrice: "3,500",
    rating: 4.8,
    reviews: 28,
  },
  {
    id: 7,
    image: SERVICE_KNOCKDOWN_HOUSE_IMAGE,
    badge: "บริการใหม่",
    name: "บริการต่อเติมบ้าน/บ้านน็อคดาวน์",
    nameEn: "House Extension & Knockdown Service",
    description:
      "บริการต่อเติมบ้าน สร้างบ้านน็อคดาวน์สมัยใหม่ ด้วยทีมวิศวกรและช่างก่อสร้างที่มีประสบการณ์ ตรวจสอบคุณภาพและปลอดภัยตามมาตรฐาน",
    features: [
      "ออกแบบสถาปัตยกรรมสมัยใหม่",
      "ก่อสร้างตามมาตรฐาน DBD",
      "ติดตั้งระบบไฟฟ้าและน้ำ",
      "ตรวจสอบคุณภาพและส่มอบ",
    ],
    price: "35,000 - 85,000",
    priceUnit: "บาท/โครงการ",
    originalPrice: "40,000 - 95,000",
    rating: 4.9,
    reviews: 25,
  },
  {
    id: 6,
    image: PRODUCT_HIKVISION_9_16_IMAGE,
    badge: "ประหยัด",
    name: "ชุดกล้องวงจรปิด IP 9-16 ตัว",
    nameEn: "Hikvision IP Camera Set 9-16 4MP",
    description:
      "ชุดกล้องวงจรปิด IP Hikvision ความละเอียด 4MP เสียงชัด พร้อมเครื่องบันทึก 16CH 4K P.o.E. NVR รับประกัน 3 ปี เหมาะสำหรับโรงแรมขนาดใหญ่และศูนย์ข้อมูล",
    features: [
      "กล้อง IP 4MP เสียงชัดเจน",
      "NVR 16CH 4K P.o.E.",
      "HDD สูงสุด 8TB (ตามจำนวนกล้อง)",
      "สาย LAN พร้อมติดตั้ง 180-320 ม.",
    ],
    price: "35,500 - 69,500",
    priceUnit: "บาท/ชุด",
    originalPrice: "40,000 - 79,000",
    rating: 5.0,
    reviews: 28,
  },
  {
    id: 5,
    image: PRODUCT_HIKVISION_5_8_IMAGE,
    badge: "ยอดเยี่ยม",
    name: "ชุดกล้องวงจรปิด IP 5-8 ตัว",
    nameEn: "Hikvision IP Camera Set 5-8 4MP",
    description:
      "ชุดกล้องวงจรปิด IP Hikvision ความละเอียด 4MP เสียงชัด พร้อมเครื่องบันทึก 8CH 4K P.o.E. NVR รับประกัน 3 ปี เหมาะสำหรับสำนักงานและโรงแรม",
    features: [
      "กล้อง IP 4MP เสียงชัดเจน",
      "NVR 8CH 4K P.o.E.",
      "HDD สูงสุด 4TB (ตามจำนวนกล้อง)",
      "สาย LAN พร้อมติดตั้ง 100-160 ม.",
    ],
    price: "19,500 - 34,500",
    priceUnit: "บาท/ชุด",
    originalPrice: "22,500 - 39,500",
    rating: 5.0,
    reviews: 38,
  },
  {
    id: 4,
    image: PRODUCT_HIKVISION_IMAGE,
    badge: "คุ้มค่า",
    name: "ชุดกล้องวงจรปิด IP 1-4 ตัว",
    nameEn: "Hikvision IP Camera Set 4MP",
    description:
      "ชุดกล้องวงจรปิด IP Hikvision ความละเอียด 4MP เสียงชัด พร้อมเครื่องบันทึก 4CH 4K P.o.E. NVR รับประกัน 2 ปี เหมาะสำหรับบ้านและสำนักงาน",
    features: [
      "กล้อง IP 4MP เสียงชัดเจน",
      "NVR 4CH 4K P.o.E.",
      "HDD สูงสุด 2TB (ตามจำนวนกล้อง)",
      "สาย LAN พร้อมติดตั้ง 20-80 ม.",
    ],
    price: "7,900 - 18,500",
    priceUnit: "บาท/ชุด",
    originalPrice: "9,500 - 22,500",
    rating: 4.9,
    reviews: 45,
  },
  {
    id: 1,
    image: PRODUCT_1_IMAGE,
    badge: "ยอดนิยม",
    name: "AI Chatbot Assistant",
    nameEn: "ระบบแชทบอท AI อัจฉริยะ",
    description:
      "ระบบแชทบอทอัจฉริยะที่ขับเคลื่อนด้วย AI ตอบคำถามลูกค้าได้อัตโนมัติตลอด 24 ชั่วโมง รองรับภาษาไทยและอังกฤษ เชื่อมต่อกับ LINE, Facebook และเว็บไซต์ได้ทันที",
    features: [
      "ตอบคำถามอัตโนมัติ 24/7",
      "รองรับภาษาไทย-อังกฤษ",
      "เชื่อมต่อ LINE & Facebook",
      "รายงานสถิติแบบ Real-time",
    ],
    price: "9,900",
    priceUnit: "บาท/เดือน",
    originalPrice: "14,900",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    image: PRODUCT_2_IMAGE,
    badge: "ใหม่",
    name: "AI Image Generator Pro",
    nameEn: "โปรแกรมสร้างภาพด้วย AI",
    description:
      "เครื่องมือสร้างภาพกราฟิกด้วยปัญญาประดิษฐ์ สร้างภาพโฆษณา โลโก้ และสื่อการตลาดคุณภาพสูงได้ในไม่กี่วินาที ไม่ต้องมีทักษะด้านกราฟิก",
    features: [
      "สร้างภาพ HD ความละเอียดสูง",
      "มากกว่า 50 สไตล์ศิลปะ",
      "ส่งออกไฟล์ PNG/JPG/SVG",
      "ใช้งานได้ไม่จำกัดครั้ง",
    ],
    price: "4,900",
    priceUnit: "บาท/เดือน",
    originalPrice: "7,900",
    rating: 4.8,
    reviews: 95,
  },
  {
    id: 3,
    image: PRODUCT_3_IMAGE,
    badge: "แนะนำ",
    name: "AI Business Automation",
    nameEn: "ระบบ Automation สำหรับธุรกิจ",
    description:
      "แพลตฟอร์มอัตโนมัติสำหรับธุรกิจ จัดการกระบวนการทำงานด้วย AI ลดงานซ้ำซ้อน เพิ่มประสิทธิภาพทีมงาน และวิเคราะห์ข้อมูลธุรกิจแบบ Real-time",
    features: [
      "Workflow อัตโนมัติครบวงจร",
      "วิเคราะห์ข้อมูล AI Dashboard",
      "เชื่อมต่อ API ภายนอก 100+",
      "รองรับทีมงานไม่จำกัด",
    ],
    price: "19,900",
    priceUnit: "บาท/เดือน",
    originalPrice: "29,900",
    rating: 5.0,
    reviews: 64,
  },
  {
    id: 12,
    image: SERVICE_BACKUP_RANSOMWARE_IMAGE,
    badge: "บริการใหม่",
    name: "บริการ Backup ป้องกัน Ransomware",
    nameEn: "Ransomware Protection Backup Service",
    description:
      "บริการสำรองข้อมูล (Backup) ระบบที่ออกแบบเพื่อป้องกันการโจมตี Ransomware ด้วยเทคโนโลยี Air-gap Backup และ Immutable Backup ทำให้ข้อมูลของคุณปลอดภัยจากการเข้ารหัสข้อมูลโดยไม่ได้รับอนุญาต",
    features: [
      "Air-gap Backup ป้องกัน Ransomware",
      "Immutable Backup ไม่สามารถแก้ไขได้",
      "Automated Daily Backup",
      "Recovery Point Objective (RPO) ต่ำ",
    ],
    price: "25,000 - 75,000",
    priceUnit: "บาท/ปี",
    originalPrice: "30,000 - 85,000",
    rating: 5.0,
    reviews: 18,
  },
  {
    id: 11,
    image: SERVICE_FIREWALL_IMAGE,
    badge: "บริการใหม่",
    name: "บริการออกแบบระบบ Firewall",
    nameEn: "Firewall System Design Service",
    description:
      "บริการออกแบบและติดตั้งระบบ Firewall ขั้นสูง เพื่อป้องกันการโจมตีจากภายนอก ควบคุมการเข้าถึงเครือข่าย และตรวจสอบการเข้าถึงข้อมูลแบบเรียลไทม์ รองรับ Next-Generation Firewall (NGFW)",
    features: [
      "ออกแบบ Firewall ตามความต้องการ",
      "Next-Generation Firewall (NGFW)",
      "Intrusion Detection & Prevention",
      "VPN & Remote Access Security",
    ],
    price: "50,000 - 150,000",
    priceUnit: "บาท/โครงการ",
    originalPrice: "60,000 - 180,000",
    rating: 4.9,
    reviews: 15,
  },
  {
    id: 10,
    image: SERVICE_ISO_27001_IMAGE,
    badge: "บริการใหม่",
    name: "เตรียมความพร้อมสำหรับ ISO 27001",
    nameEn: "ISO 27001 Readiness Preparation",
    description:
      "บริการให้คำปรึกษาและเตรียมความพร้อมสำหรับการรับรอง ISO 27001 (Information Security Management System) ช่วยให้องค์กรของคุณปฏิบัติตามมาตรฐานความปลอดภัยข้อมูลระหว่างประเทศ",
    features: [
      "ประเมินสถานะความพร้อมปัจจุบัน",
      "วางแผนและออกแบบ ISMS",
      "ฝึกอบรมเจ้าหน้าที่",
      "เตรียมเอกสารสำหรับการตรวจสอบ",
    ],
    price: "100,000 - 250,000",
    priceUnit: "บาท/โครงการ",
    originalPrice: "120,000 - 300,000",
    rating: 4.8,
    reviews: 12,
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Image Modal Component
function ImageModal({ image, onClose }: { image: string; onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Product Detail"
          className="w-full h-full object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#C9A84C] hover:bg-[#B8942F] text-[#1A1A2E] p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const { ref, inView } = useInView();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <section id="products" className="py-20 md:py-28 bg-[#1A1A2E] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
              สินค้าของเรา
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                บริการและผลิตภัณฑ์
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-[#C9A84C] mt-1">
                โซลูชันครบวงจรสำหรับธุรกิจและที่อยู่อาศัย
              </h3>
            </div>
            <p className="text-white/50 text-sm max-w-sm text-right hidden md:block">
              กล้องวงจรปิด ระบบไฟฟ้า Fiber Optic<br />
              LAN/WIFI บ้านน็อคดาวน์ และอื่นๆ
            </p>
          </div>

          {/* Products grid */}
          <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <div
                key={product.id}
                className={`group relative bg-[#0f0f1e] border border-white/10 rounded-sm overflow-hidden transition-all duration-700 hover:border-[#C9A84C]/60 hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Gold top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C9A84C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />

                {/* Product image */}
                <div
                  className="relative bg-white/5 cursor-pointer overflow-hidden group/image"
                  onClick={() => setSelectedImage(product.image)}
                >
                  <div className="w-full h-52 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={`${product.name} - ${product.description.substring(0, 50)}...`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                    loading="lazy"
                  />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1e] via-[#0f0f1e]/30 to-transparent pointer-events-none" />

                  {/* Zoom indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-black/40">
                    <div className="bg-[#C9A84C] text-[#1A1A2E] px-4 py-2 rounded-sm font-bold text-sm">
                      คลิกเพื่อดูรูปเต็ม
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-[#C9A84C] text-[#1A1A2E] text-xs font-bold px-3 py-1 rounded-sm tracking-wide">
                    {product.badge}
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-sm">
                    <Star className="w-3.5 h-3.5 text-[#C9A84C] fill-[#C9A84C]" />
                    <span className="text-white text-xs font-bold">{product.rating}</span>
                    <span className="text-white/50 text-xs">({product.reviews})</span>
                  </div>
                </div>

                {/* Product content */}
                <div className="p-6">
                  {/* Product name */}
                  <div className="mb-3">
                    <h3 className="text-white font-bold text-xl leading-tight group-hover:text-[#C9A84C] transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-[#C9A84C]/70 text-xs tracking-wide mt-0.5">
                      {product.nameEn}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-white/55 text-sm leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-6">
                    {product.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-white/60 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* Divider */}
                  <div className="border-t border-white/10 mb-4" />

                  {/* Price */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#C9A84C]" />
                        <span className="text-[#C9A84C] text-2xl font-bold">
                          ฿{product.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/30 text-xs line-through">
                          ฿{product.originalPrice}
                        </span>
                        <span className="text-white/50 text-xs">{product.priceUnit}</span>
                      </div>
                    </div>
                    <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold px-2 py-1 rounded-sm">
                      ประหยัด{" "}
                      {Math.round(
                        (((parseInt(
                          product.originalPrice.split("-")[0].replace(",", "")
                        ) -
                          parseInt(product.price.split("-")[0].replace(",", "")))) /
                          parseInt(
                            product.originalPrice.split("-")[0].replace(",", "")
                          )) *
                          100
                      )}
                      %
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      const el = document.querySelector("#contact");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] font-bold text-sm py-3 rounded-sm hover:bg-[#C9A84C] hover:text-[#1A1A2E] transition-all duration-300 tracking-wide"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    สนใจสินค้า / ติดต่อสอบถาม
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-10 text-center">
            <p className="text-white/40 text-sm">
              * ราคาดังกล่าวเป็นราคาเริ่มต้น สามารถติดต่อเพื่อรับใบเสนอราคาที่เหมาะสมกับธุรกิจของคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </>
  );
}
