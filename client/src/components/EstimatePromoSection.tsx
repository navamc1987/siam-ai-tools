import { Calculator, Clock, BadgeCheck } from "lucide-react";

export default function EstimatePromoSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0f0f1e] to-[#1A1A2E] relative overflow-hidden">
      <div className="absolute inset-0 hex-pattern opacity-30" />
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">คำนวณราคา</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              ประเมินราคาเบื้องต้นได้ทันที
            </h2>
            <p className="text-white/70 text-base md:text-lg mt-3">
              กรอกข้อมูลหลัก ๆ แล้วได้ช่วงราคาในไม่กี่นาที เหมาะสำหรับงานต่อเติม/รีโนเวท ช่วยลดเวลาคัดกรองก่อนนัดดูหน้างาน
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="/estimate" className="btn-gold px-7 py-3 rounded-sm font-bold text-sm tracking-wide">
                ไปที่หน้าประเมินราคา
              </a>
              <button
                onClick={() => {
                  const el = document.querySelector("#contact");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-secondary px-7 py-3 text-sm"
              >
                คุยกับทีมงาน
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-6">
              <Calculator className="w-6 h-6 text-[#C9A84C] mb-3" />
              <p className="text-white font-bold">คำนวณเป็นช่วงราคา</p>
              <p className="text-white/60 text-sm mt-1">ใช้ฐานราคา/ตร.ม. + ตัวคูณตามความจริง</p>
            </div>
            <div className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-6">
              <Clock className="w-6 h-6 text-[#C9A84C] mb-3" />
              <p className="text-white font-bold">ลดเวลาหน้างาน</p>
              <p className="text-white/60 text-sm mt-1">ช่วยคัดกรองงบประมาณก่อนนัดสำรวจ</p>
            </div>
            <div className="bg-[#0f0f1e] border border-[#C9A84C]/20 rounded-sm p-6">
              <BadgeCheck className="w-6 h-6 text-[#C9A84C] mb-3" />
              <p className="text-white font-bold">ส่งให้ทีมต่อได้</p>
              <p className="text-white/60 text-sm mt-1">กดส่งรายละเอียดไปหน้าติดต่อทันที</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

