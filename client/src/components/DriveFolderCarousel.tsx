import { useEffect, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type DriveFile = {
  id: string;
  name?: string;
};

function getThumbnailUrl(fileId: string, size = 800) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${size}`;
}

function getFileUrl(fileId: string) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}

export default function DriveFolderCarousel({
  title,
  folderId,
  folderUrl,
}: {
  title: string;
  folderId: string;
  folderUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/drive-folder?folderId=${encodeURIComponent(folderId)}`);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { files?: DriveFile[] };
        if (!cancelled) setFiles(json.files ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "โหลดรูปไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [folderId]);

  const slides = useMemo(() => files.slice(0, 40), [files]);

  return (
    <div className="bg-white border border-[#d0d7de] rounded-xl p-4 md:p-6">
      <div className="mb-5">
        <h3 className="text-[#1f2328] font-bold text-lg">{title}</h3>
      </div>

      {loading && <div className="text-[#656d76] text-sm">กำลังโหลดรูป…</div>}

      {!loading && error && (
        <div className="bg-[#fff8c5] border border-[#d0d7de] rounded-lg p-4 text-[#1f2328] text-sm">
          โหลดรูปไม่สำเร็จ (ยังสามารถกดเปิดอัลบั้มได้): {error}
        </div>
      )}

      {!loading && !error && slides.length > 0 && (
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3 md:-ml-4">
            {slides.map((f) => (
              <CarouselItem key={f.id} className="pl-3 md:pl-4 basis-[75%] sm:basis-1/2 lg:basis-1/4">
                <a
                  href={getFileUrl(f.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg overflow-hidden border border-[#d0d7de] bg-[#f6f8fa]"
                >
                  <img
                    src={getThumbnailUrl(f.id)}
                    alt={f.name ?? title}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      )}

      {!loading && !error && slides.length === 0 && (
        <div className="text-[#656d76] text-sm">ยังไม่พบรูปในอัลบั้มนี้</div>
      )}
    </div>
  );
}
