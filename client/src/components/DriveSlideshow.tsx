import { useEffect, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { driveGalleryGroups } from "@/data/driveFolders";

type DriveFile = {
  id: string;
  name?: string;
};

function getThumbnailUrl(fileId: string, size = 1400) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${size}`;
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DriveSlideshow({
  maxPerFolder = 25,
  maxSlides = 60,
}: {
  maxPerFolder?: number;
  maxSlides?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);

  const folders = useMemo(() => driveGalleryGroups.flatMap((g) => g.galleries), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          folders.map(async (f) => {
            const res = await fetch(`/api/drive-folder?folderId=${encodeURIComponent(f.folderId)}&limit=${maxPerFolder}`);
            if (!res.ok) return [] as DriveFile[];
            const json = (await res.json()) as { files?: DriveFile[] };
            return json.files ?? [];
          })
        );

        if (cancelled) return;
        const merged = results.flat();
        setFiles(merged);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [folders, maxPerFolder]);

  const slides = useMemo(() => {
    const merged = shuffleInPlace([...files]);
    return merged.slice(0, maxSlides);
  }, [files, maxSlides]);

  return (
    <div className="bg-white border border-[#d0d7de] rounded-xl p-4 md:p-6">
      {loading && <div className="text-[#656d76] text-sm">กำลังโหลดรูป…</div>}

      {!loading && slides.length > 0 && (
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3 md:-ml-4">
            {slides.map((f) => (
              <CarouselItem key={f.id} className="pl-3 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                <div className="rounded-lg overflow-hidden border border-[#d0d7de] bg-[#f6f8fa]">
                  <img
                    src={getThumbnailUrl(f.id)}
                    alt={f.name ?? "ผลงาน"}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      )}

      {!loading && slides.length === 0 && (
        <div className="text-[#656d76] text-sm">ยังไม่พบรูปจาก Google Drive</div>
      )}
    </div>
  );
}
