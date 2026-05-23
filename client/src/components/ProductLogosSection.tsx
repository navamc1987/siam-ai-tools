import { productLogos } from "@/data/productLogos";

export default function ProductLogosSection() {
  if (!productLogos.length) return null;

  return (
    <section className="bg-white border-b border-[#d0d7de]">
      <div className="container py-10">
        <div className="text-center">
          <div className="text-[#1f2328] font-bold text-lg">แบรนด์สินค้าที่เราใช้</div>
          <div className="text-[#656d76] text-sm mt-2">เลือกของแท้ มาตรฐานงานติดตั้ง</div>
        </div>

        <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {productLogos.map((logo) => (
            <div
              key={logo.src}
              className="h-16 bg-white border border-[#d0d7de] rounded-xl px-4 py-3 flex items-center justify-center shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

