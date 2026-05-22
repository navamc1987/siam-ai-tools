import { Camera, Cable, HardDrive } from "lucide-react";

export default function CctvPromoSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#ffffff] to-[#f6f8fa] border-y border-[#d0d7de]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-[#0969da]" />
              <span className="text-[#0969da] text-xs font-semibold tracking-widest uppercase">CCTV Spec</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1f2328] leading-tight">
              จัดสเปคกล้องวงจรปิดแบบเป็นระบบ
            </h2>
            <p className="text-[#656d76] text-base md:text-lg mt-3">
              เลือกยี่ห้อ/รุ่นจากราคาหน้าเว็บ + ใส่จำนวนกล้องและระยะสายรวม แล้วได้ค่าวัสดุและค่าแรงติดตั้งทันที
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="/cctv" className="btn-blue px-7 py-3 rounded-sm font-bold text-sm tracking-wide">
                ไปที่หน้าจัดสเปคกล้อง
              </a>
              <button
                onClick={() => {
                  const el = document.querySelector("#contact");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-secondary px-7 py-3 text-sm"
              >
                ขอให้ทีมช่วยจัดสเปค
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#d0d7de] rounded-sm p-6">
              <Camera className="w-6 h-6 text-[#0969da] mb-3" />
              <p className="text-[#1f2328] font-bold">เลือกกล้อง/ฟังก์ชัน</p>
              <p className="text-[#656d76] text-sm mt-1">IR / Full Color / ไมค์ / โต้ตอบ</p>
            </div>
            <div className="bg-white border border-[#d0d7de] rounded-sm p-6">
              <HardDrive className="w-6 h-6 text-[#0969da] mb-3" />
              <p className="text-[#1f2328] font-bold">เครื่องบันทึก + HDD</p>
              <p className="text-[#656d76] text-sm mt-1">เลือกตามจำนวนกล้องและความจุ</p>
            </div>
            <div className="bg-white border border-[#d0d7de] rounded-sm p-6">
              <Cable className="w-6 h-6 text-[#0969da] mb-3" />
              <p className="text-[#1f2328] font-bold">ค่าแรงตามเมตร</p>
              <p className="text-[#656d76] text-sm mt-1">คำนวณจากระยะสายรวม + เผื่อโค้ง</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

