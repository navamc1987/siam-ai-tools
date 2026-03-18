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
const SERVICE_ERPNEXT_IMAGE = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80";

const products = [
  {
    id: 101,
    image: SERVICE_ERPNEXT_IMAGE,
    badge: "จุดขายหลัก",
    name: "Implement ERPNext (Full Option)",
    nameEn: "ERPNext Implementation Full Option",
    description:
      "โซลูชันบริหารจัดการองค์กรแบบครบวงจร (ERP) ที่ปรับแต่งได้ 100% สำหรับธุรกิจขนาดกลาง-ใหญ่ ครอบคลุมทุกกระบวนการทำงานในระบบเดียว",
    features: [
      "Customization & Workflow 100%",
      "ระบบบัญชี, ผลิต, จัดซื้อ, ขาย, HR",
      "เชื่อมต่อ API กับระบบภายนอกได้ไม่จำกัด",
      "On-site Training & Support 1 ปี",
    ],
    price: "1,800,000",
    priceUnit: "บาท/โครงการ",
    originalPrice: "2,200,000",
    rating: 5.0,
    reviews: 12,
  },
  {
    id: 100,
    image: SERVICE_ERPNEXT_IMAGE,
    badge: "คุ้มค่าที่สุด",
    name: "Implement ERPNext (Start Kit)",
    nameEn: "ERPNext Implementation Start Kit",
    description:
      "เริ่มต้นระบบ ERP สำหรับ SME ด้วยฟังก์ชันมาตรฐานที่จำเป็นครบถ้วน ติดตั้งไว พร้อมใช้งานได้ทันที ช่วยจัดระเบียบธุรกิจให้เป็นระบบ",
    features: [
      "โมดูลพื้นฐาน: บัญชี, คลังสินค้า, ขาย",
      "Cloud Hosting พร้อมใช้งาน",
      "คู่มือการใช้งานภาษาไทย",
      "Support ออนไลน์ 6 เดือน",
    ],
    price: "250,000",
    priceUnit: "บาท/โครงการ",
    originalPrice: "350,000",
    rating: 4.9,
    reviews: 24,
  },
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
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const categories = ["ทั้งหมด", "ERP & AI", "ระบบรักษาความปลอดภัย", "บริการวิศวกรรม"];

  const filteredProducts = products.filter((p) => {
    if (activeCategory === "ทั้งหมด") return true;
    if (activeCategory === "ERP & AI") return p.id >= 100 || p.id <= 3;
    if (activeCategory === "ระบบรักษาความปลอดภัย") return (p.id >= 4 && p.id <= 6) || (p.id >= 10 && p.id <= 12);
    if (activeCategory === "บริการวิศวกรรม") return p.id >= 7 && p.id <= 9;
    return true;
  });

  return (
    <section id="products" className="py-20 md:py-28 bg-[#0f0f1e]">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">สินค้าและบริการ</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">โซลูชันที่ตอบโจทย์</h2>
            <p className="text-white/50 max-w-xl">
              เรานำเสนอเทคโนโลยีและบริการที่ทันสมัยที่สุด เพื่อยกระดับธุรกิจและที่อยู่อาศัยของคุณให้ก้าวไกลไปอีกขั้น
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-sm transition-all ${
                  activeCategory === cat
                    ? "bg-[#C9A84C] text-[#1A1A2E]"
                    : "bg-[#1A1A2E] text-white/60 hover:text-white border border-[#C9A84C]/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, i) => (
            <div
              key={product.id}
              className={`group bg-[#1A1A2E] border border-[#C9A84C]/10 rounded-sm overflow-hidden flex flex-col transition-all duration-700 hover:border-[#C9A84C]/40 hover:shadow-2xl hover:shadow-[#C9A84C]/5 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => setSelectedImage(product.image)}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#C9A84C] text-[#1A1A2E] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                    {product.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-sm">
                    <Star className="w-3 h-3 text-[#C9A84C]" fill="currentColor" />
                    <span className="text-white text-[10px] font-bold">{product.rating}</span>
                    <span className="text-white/40 text-[10px]">({product.reviews})</span>
                  </div>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-white font-bold text-xl mb-1 group-hover:text-[#C9A84C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium">
                    {product.nameEn}
                  </p>
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>

                <div className="space-y-2 mb-8 flex-grow">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                      <span className="text-white/70 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#C9A84C]/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-3 h-3 text-[#C9A84C]" />
                      <span className="text-white/30 text-[10px] line-through">฿{product.originalPrice}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#C9A84C] font-bold text-xl">฿{product.price}</span>
                      <span className="text-white/40 text-[10px]">{product.priceUnit}</span>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1A1A2E] transition-all">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
    </section>
  );
}
