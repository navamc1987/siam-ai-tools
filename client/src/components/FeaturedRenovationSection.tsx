import { portfolioItems } from "@/data/portfolio";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function FeaturedRenovationSection() {
  const renovationItems = portfolioItems.filter((item) => item.category === "ต่อเติมและรีโนเวท");

  const slides = renovationItems.flatMap((item) => {
    const images = [{ image: item.featured_image, caption: item.title }, ...(item.gallery ?? [])];
    return images.map((img) => ({
      ...img,
      title: item.title,
    }));
  });

  return (
    <section className="py-20 bg-white border-y border-[#d0d7de]">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#0969da]" />
              <span className="text-[#1f2328] text-xs font-semibold tracking-wide uppercase">งานรับเหมาต่อเติม</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1f2328] leading-tight">
              โฟกัส “ต่อเติม & รีโนเวท” ให้เห็นภาพจริง
            </h2>
            <p className="text-[#656d76] text-base md:text-lg mt-3">
              รวมภาพตัวอย่างงานจริง เพื่อช่วยตัดสินใจเร็วขึ้น ก่อนคุยรายละเอียดและนัดสำรวจหน้างาน
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/portfolio?category=ต่อเติมและรีโนเวท" className="btn-blue px-6 py-3 text-sm">
              ดูผลงานต่อเติมทั้งหมด
            </a>
            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-secondary px-6 py-3 text-sm"
            >
              ปรึกษาฟรี
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#d0d7de] rounded-xl p-4 md:p-6">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3 md:-ml-4">
              {slides.map((slide, idx) => (
                <CarouselItem key={`${slide.image}-${idx}`} className="pl-3 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                  <div className="rounded-lg overflow-hidden border border-[#d0d7de] bg-[#f6f8fa]">
                    <div className="relative">
                      <img src={slide.image} alt={slide.caption ?? slide.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-bold text-sm leading-tight line-clamp-2">{slide.title}</p>
                        {slide.caption && <p className="text-white/80 text-xs mt-1 line-clamp-1">{slide.caption}</p>}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex" />
            <CarouselNext className="hidden lg:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

