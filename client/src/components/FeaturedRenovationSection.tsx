import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useMemo, useState } from "react";
import { homeShowcaseDriveFolderId } from "@/data/driveShowcase";

type DriveFile = {
  id: string;
  name?: string;
};

type DriveFolder = {
  id: string;
  name?: string;
};

function getThumbnailUrl(fileId: string, size = 1200) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${size}`;
}

export default function FeaturedRenovationSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await fetch(
          `/api/drive-folder?folderId=${encodeURIComponent(homeShowcaseDriveFolderId)}&includeFolders=1`
        );
        if (!res.ok) {
          setError(true);
          return;
        }
        const json = (await res.json()) as { files?: DriveFile[]; folders?: DriveFolder[] };
        if (cancelled) return;

        const directFiles = json.files ?? [];
        if (directFiles.length > 0) {
          setFiles(directFiles);
          return;
        }

        const folders = json.folders ?? [];
        if (folders.length === 0) {
          setFiles([]);
          return;
        }

        const results = await Promise.all(
          folders.map(async (f) => {
            const r = await fetch(`/api/drive-folder?folderId=${encodeURIComponent(f.id)}&limit=60`);
            if (!r.ok) return [] as DriveFile[];
            const j = (await r.json()) as { files?: DriveFile[] };
            return j.files ?? [];
          })
        );

        if (cancelled) return;
        setFiles(results.flat());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    const list = [...files];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 30);
  }, [files]);

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
              “ต่อเติม & รีโนเวท & งานระบบ”
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
          {loading && <div className="text-[#656d76] text-sm">กำลังโหลดรูป…</div>}

          {!loading && slides.length > 0 && (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-3 md:-ml-4">
                {slides.map((f) => (
                  <CarouselItem key={f.id} className="pl-3 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="rounded-lg overflow-hidden border border-[#d0d7de] bg-[#f6f8fa]">
                      <img src={getThumbnailUrl(f.id)} alt={f.name ?? "งานต่อเติม"} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>
          )}

          {!loading && slides.length === 0 && (
            <div className="text-[#656d76] text-sm">
              {error ? "โหลดรูปไม่สำเร็จ" : "ยังไม่พบรูปในอัลบั้ม Google Drive นี้"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

