/*
 * Design: GitHub-Inspired Minimalist Products
 * - Light gray background with white cards
 * - Simple borders, clear hierarchy, no complex gradients
 */
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Star, Tag, CheckCircle, ArrowRight } from "lucide-react";

const SERVICE_ERPNEXT_IMAGE = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80";
const SERVICE_RENOVATION_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663452304962/PVRYMsfSfimLrYnG.jpg";
const SERVICE_SOLAR_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663452304962/JtLOKyVnpQrGoTlJ.jpg";
const SERVICE_LIGHTING_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663452304962/eycwlKfwZCScooSl.jpg";
const SERVICE_CCTV_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663452304962/mUnGVKmJuJxAzJmP.png";
const SERVICE_CCTV_8CH_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663452304962/voDgUssYOICvZKmP.png";

const products = [
  {
    id: 201,
    image: SERVICE_RENOVATION_IMAGE,
    badge: "Popular",
    name: "บริการต่อเติมและรีโนเวท",
    description: "บริการต่อเติมและรีโนเวทห้องต่างๆ ทั้งห้องน้ำ ห้องครัว ห้องนอน โรงจอดรถ และหลังคา",
    features: ["ออกแบบและปรึกษา", "ติดตั้งและก่อสร้าง", "ตรวจสอบคุณภาพ", "รับประกันงาน"],
    price: "ตามหน้างาน",
    category: "บริการต่อเติมและรีโนเวท",
  },
  {
    id: 202,
    image: SERVICE_SOLAR_IMAGE,
    badge: "Eco-Friendly",
    name: "ติดตั้งแผงโซล่าเซลล์",
    description: "ระบบพลังงานแสงอาทิตย์ประสิทธิภาพสูง พร้อม Inverter และระบบเก็บพลังงาน ประหยัดค่าไฟฟ้า",
    features: ["แผงโซล่าเซลล์คุณภาพ", "ระบบ Inverter ทันสมัย", "ระบบเก็บพลังงาน", "ประหยัดค่าไฟฟ้า"],
    price: "ตามหน้างาน",
    category: "บริการต่อเติมและรีโนเวท",
  },
  {
    id: 101,
    image: SERVICE_ERPNEXT_IMAGE,
    badge: "Enterprise",
    name: "ติดตั้ง ERPNext แพ็กเกจเต็ม",
    description: "โซลูชันบริหารจัดการองค์กรแบบครบวงจร ปรับแต่งได้ 100% สำหรับธุรกิจขนาดกลาง-ใหญ่",
    features: ["Customization 100%", "Accounting, HR, Buying", "Unlimited API", "Support 1 Year"],
    price: "1,800,000",
    category: "ERP & AI",
  },
  {
    id: 100,
    image: SERVICE_ERPNEXT_IMAGE,
    badge: "Starter",
    name: "ติดตั้ง ERPNext แพ็กเกจเริ่มต้น",
    description: "เริ่มต้นระบบ ERP สำหรับ SME ด้วยฟังก์ชันมาตรฐานที่จำเป็นครบถ้วน ติดตั้งไว พร้อมใช้งาน",
    features: ["Standard Modules", "Cloud Hosting", "Thai Manual", "Support 6 Months"],
    price: "250,000",
    category: "ERP & AI",
  },
  {
    id: 1,
    image: SERVICE_RENOVATION_IMAGE,
    badge: "Industrial",
    name: "ระบบควบคุมไฟฟ้าและตู้คอนโทรล",
    description: "ออกแบบและติดตั้งระบบควบคุมไฟฟ้า ตู้ MDB และระบบควบคุมอัตโนมัติในโรงงานอุตสาหกรรม",
    features: ["Industrial Standard", "Safe & Reliable", "Professional Design", "Maintenance 1-3 Days"],
    price: "ตามหน้างาน",
    category: "ระบบไฟฟ้า",
  },
  {
    id: 2,
    image: SERVICE_SOLAR_IMAGE,
    badge: "Technology",
    name: "ระบบคอมพิวเตอร์และเครือข่าย",
    description: "วางระบบ Server, LAN, Wi‑Fi และ Fiber Optic ความเร็วสูง สำหรับสำนักงานและโรงงาน",
    features: ["High-speed Connectivity", "Network Security", "Fiber Optic Splicing", "24/7 Monitoring"],
    price: "ตามหน้างาน",
    category: "ระบบไฟฟ้า",
  },
  {
    id: 3,
    image: SERVICE_LIGHTING_IMAGE,
    badge: "Smart Office",
    name: "ระบบแสงสว่างและประหยัดพลังงาน",
    description: "ติดตั้งระบบแสงสว่างอัจฉริยะ (Smart Lighting) และระบบประหยัดพลังงานไฟฟ้าในอาคาร",
    features: ["Energy Saving", "Smart Control", "Modern Design", "ROI Optimization"],
    price: "ตามหน้างาน",
    category: "ระบบไฟฟ้า",
  },
  {
    id: 4,
    image: SERVICE_CCTV_IMAGE,
    badge: "Promotion",
    name: "ชุดกล้องวงจรปิด Hikvision IP (1-4 ตัว)",
    description: "กล้อง IP ความชัดเจน 4MP พร้อมเครื่องบันทึก 4CH 4K PoE NVR รับประกัน 2 ปี",
    features: [
      "1 ตัว: 7,900 - 9,500 (1TB, 20ม.)",
      "2 ตัว: 9,900 - 12,500 (1TB, 40ม.)",
      "3 ตัว: 12,900 - 15,500 (1TB, 60ม.)",
      "4 ตัว: 15,900 - 18,500 (2TB, 80ม.)"
    ],
    price: "เริ่มต้น 7,900.-",
    category: "ระบบไฟฟ้า",
  },
  {
    id: 5,
    image: SERVICE_CCTV_8CH_IMAGE,
    badge: "Best Price",
    name: "ชุดกล้องวงจรปิด Hikvision IP (5-8 ตัว)",
    description: "กล้อง IP ความชัดเจน 4MP พร้อมเครื่องบันทึก NVR 8 ช่อง 4K PoE รับประกัน 3 ปี",
    features: [
      "5 ตัว: 19,500 - 22,500 (2TB, 100ม.)",
      "6 ตัว: 22,900 - 26,500 (2TB, 120ม.)",
      "7 ตัว: 25,900 - 29,500 (2TB, 140ม.)",
      "8 ตัว: 29,900 - 34,500 (4TB, 160ม.)"
    ],
    price: "เริ่มต้น 19,500.-",
    category: "ระบบไฟฟ้า",
  },
];

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const categories = ["ทั้งหมด", "บริการต่อเติมและรีโนเวท", "ERP & AI", "ระบบไฟฟ้า"];

  const filteredProducts = activeCategory === "ทั้งหมด" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="py-24 bg-[#f6f8fa] border-y border-[#d0d7de]">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1f2328] mb-4">บริการและสินค้าครบวงจร</h2>
            <p className="text-[#656d76] text-lg">
              ผู้เชี่ยวชาญด้านการต่อเติม รีโนเวท ติดตั้งโซล่าเซลล์ ระบบไฟฟ้า แสงสว่าง เครือข่าย CCTV และ ERPNext
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all border ${
                  activeCategory === cat
                    ? "bg-[#0969da] text-white border-[#0969da]"
                    : "bg-white text-[#1f2328] border-[#d0d7de] hover:bg-[#f3f4f6]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-[#d0d7de] rounded-lg overflow-hidden flex flex-col hover:border-[#0969da] hover:shadow-lg transition-all"
            >
              {/* Image Area */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[#f6f8fa]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#f6f8fa] text-[#1f2328] text-[10px] font-bold px-2 py-1 rounded-md border border-[#d0d7de] uppercase">
                    {product.badge}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-[#1f2328] font-bold text-xl mb-2 group-hover:text-[#0969da] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[#656d76] text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-2 mb-8 flex-grow">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#0969da] mt-0.5 shrink-0" />
                      <span className="text-[#1f2328] text-xs font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#d0d7de] flex items-center justify-between">
                  <div>
                    <span className="text-[#656d76] text-[10px] font-bold uppercase block mb-1">ราคา</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#1f2328] font-bold text-xl">
                        {product.price.startsWith("฿") || product.price === "ตามหน้างาน" ? product.price : `฿${product.price}`}
                      </span>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-md bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center text-[#1f2328] hover:bg-[#0969da] hover:text-white hover:border-[#0969da] transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <button 
            onClick={() => {
              const el = document.querySelector("#contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-secondary px-8 py-3 text-base"
          >
            ปรึกษาโครงการกับเรา
          </button>
        </div>
      </div>
    </section>
  );
}
