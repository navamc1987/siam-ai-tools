/*
 * Design: GitHub-Inspired Minimalist Products
 * - Light gray background with white cards
 * - Simple borders, clear hierarchy, no complex gradients
 */
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Star, Tag, CheckCircle, ArrowRight } from "lucide-react";

const SERVICE_ERPNEXT_IMAGE = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80";
const SERVICE_FIBER_OPTIC_IMAGE = "/images/products/fiber-optic.jpg";
const PRODUCT_HIKVISION_IMAGE = "/images/products/hikvision-ip-1-4.png";

const products = [
  {
    id: 101,
    image: SERVICE_ERPNEXT_IMAGE,
    badge: "Enterprise",
    name: "Implement ERPNext (Full Option)",
    description: "โซลูชันบริหารจัดการองค์กรแบบครบวงจร ปรับแต่งได้ 100% สำหรับธุรกิจขนาดกลาง-ใหญ่",
    features: ["Customization 100%", "Accounting, HR, Buying", "Unlimited API", "Support 1 Year"],
    price: "1,800,000",
    rating: 5.0,
  },
  {
    id: 100,
    image: SERVICE_ERPNEXT_IMAGE,
    badge: "Starter",
    name: "Implement ERPNext (Start Kit)",
    description: "เริ่มต้นระบบ ERP สำหรับ SME ด้วยฟังก์ชันมาตรฐานที่จำเป็นครบถ้วน ติดตั้งไว พร้อมใช้งาน",
    features: ["Standard Modules", "Cloud Hosting", "Thai Manual", "Support 6 Months"],
    price: "250,000",
    rating: 4.9,
  },
  {
    id: 9,
    image: SERVICE_FIBER_OPTIC_IMAGE,
    badge: "Service",
    name: "บริการติดตั้ง Fiber Optic",
    description: "บริการติดตั้งระบบ Fiber Optic ความเร็วสูง สำหรับอาคารและสำนักงาน โดยช่างผู้เชี่ยวชาญ",
    features: ["High-speed Gbps", "Custom Design", "Quality Check", "Repair 1-3 Days"],
    price: "2,500",
    rating: 4.9,
  },
];

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const categories = ["ทั้งหมด", "ERP & AI", "ระบบรักษาความปลอดภัย", "บริการวิศวกรรม"];

  return (
    <section id="products" className="py-24 bg-[#f6f8fa] border-y border-[#d0d7de]">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1f2328] mb-4">สินค้าและบริการ</h2>
            <p className="text-[#656d76] text-lg">
              โซลูชันเทคโนโลยีที่ทันสมัย ออกแบบมาเพื่อเพิ่มประสิทธิภาพให้กับธุรกิจของคุณโดยเฉพาะ
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
          {products.map((product) => (
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
                    <span className="text-[#656d76] text-[10px] font-bold uppercase block mb-1">เริ่มต้น</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#1f2328] font-bold text-2xl">฿{product.price}</span>
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
          <button className="btn-secondary px-8 py-3 text-base">
            ดูสินค้าทั้งหมด
          </button>
        </div>
      </div>
    </section>
  );
}
