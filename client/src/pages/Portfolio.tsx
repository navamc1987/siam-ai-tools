/*
 * Portfolio/Gallery Page
 * Static portfolio gallery grouped by service category.
 */
import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import { portfolioCategories, portfolioItems, type PortfolioItem } from "@/data/portfolio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { instagramProfileUrl } from "@/data/instagramEmbeds";
import { driveGalleryGroups } from "@/data/driveFolders";
import DriveFolderCarousel from "@/components/DriveFolderCarousel";

const categoryImageStyles: Record<string, string> = {
  "ต่อเติมและรีโนเวท": "aspect-[4/3] object-cover object-center",
  "ติดตั้งโซล่าเซลล์": "aspect-[16/10] object-cover object-center",
  "ระบบไฟฟ้า": "aspect-[16/10] object-cover object-center",
  "ระบบแสงสว่าง": "aspect-[4/3] object-cover object-center",
  "ระบบ CCTV": "aspect-[16/10] object-cover object-center",
  "อื่น ๆ": "aspect-[4/3] object-cover object-center",
};

const categoryBadgeStyles: Record<string, string> = {
  "ต่อเติมและรีโนเวท": "bg-amber-600",
  "ติดตั้งโซล่าเซลล์": "bg-emerald-600",
  "ระบบไฟฟ้า": "bg-blue-700",
  "ระบบแสงสว่าง": "bg-yellow-600",
  "ระบบ CCTV": "bg-slate-700",
  "อื่น ๆ": "bg-purple-700",
};

function getImageClass(category: string) {
  return categoryImageStyles[category] ?? categoryImageStyles["อื่น ๆ"];
}

function getBadgeClass(category: string) {
  return categoryBadgeStyles[category] ?? categoryBadgeStyles["อื่น ๆ"];
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && portfolioCategories.includes(category)) {
      setSelectedCategory(category);
    }
  }, []);

  const publishedItems = useMemo(() => portfolioItems.filter((item) => item.published !== false), []);

  const filteredItems =
    selectedCategory === "ทั้งหมด"
      ? publishedItems
      : publishedItems.filter((item) => item.category === selectedCategory);

  const selectedImages = selectedItem
    ? [{ image: selectedItem.featured_image, caption: selectedItem.title }, ...(selectedItem.gallery ?? [])]
    : [];

  const handleNextImage = () => {
    if (selectedImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="relative min-h-[40vh] flex items-center pt-24 pb-16 bg-gradient-to-br from-[#1A1A2E] to-[#0f0f1e]">
        <div className="absolute inset-0 hex-pattern opacity-30" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">ผลงานของเรา</h1>
            <p className="text-white/70 text-lg">
              ชมผลงานโครงการต่อเติม รีโนเวท ติดตั้งโซล่าเซลล์ ระบบไฟฟ้า แสงสว่าง และ CCTV ที่จัดหมวดหมู่รูปภาพให้เหมาะกับประเภทงาน
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1f2328]">ผลงานในเว็บไซต์</h2>
              <p className="text-[#656d76] text-sm md:text-base mt-2">
                เลือกหมวดหมู่เพื่อดูรูปผลงาน หากต้องการดูเพิ่มเติมสามารถกดไปที่ Instagram ได้
              </p>
            </div>
            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-6 py-3 text-sm whitespace-nowrap text-center"
            >
              ดูเพิ่มเติมใน Instagram
            </a>
          </div>

          <div className="flex flex-wrap gap-3 mb-12 justify-center md:justify-start">
            {portfolioCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentImageIndex(0);
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all border ${
                  selectedCategory === cat
                    ? "bg-[#0969da] text-white border-[#0969da]"
                    : "bg-white text-[#1f2328] border-[#d0d7de] hover:bg-[#f3f4f6]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredItems.map((item, idx) => (
                <article
                  key={`${item.title}-${idx}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setCurrentImageIndex(0);
                  }}
                  className="group cursor-pointer bg-white border border-[#d0d7de] rounded-xl overflow-hidden hover:border-[#0969da] hover:shadow-xl transition-all"
                >
                  <div className="relative overflow-hidden bg-[#f6f8fa]">
                    <img
                      src={item.featured_image}
                      alt={item.title}
                      loading="lazy"
                      className={`w-full ${getImageClass(item.category)} group-hover:scale-105 transition-transform duration-300`}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`${getBadgeClass(item.category)} text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-[#1f2328] font-bold text-lg mb-2 group-hover:text-[#0969da] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#656d76] text-sm line-clamp-2 mb-4">
                      {item.description || "ไม่มีรายละเอียด"}
                    </p>

                    <div className="space-y-2">
                      {item.location && (
                        <div className="flex items-center gap-2 text-[#656d76] text-xs">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.date && (
                        <div className="flex items-center gap-2 text-[#656d76] text-xs">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.date).toLocaleDateString("th-TH")}</span>
                        </div>
                      )}
                    </div>

                    <button className="mt-4 w-full py-2 border border-[#d0d7de] rounded-md text-[#1f2328] font-semibold text-sm hover:bg-[#f6f8fa] transition-colors flex items-center justify-center gap-2">
                      ดูรายละเอียด
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#656d76] text-lg">ยังไม่มีผลงานในหมวดหมู่นี้</p>
            </div>
          )}

          <div className="mt-20">
            {driveGalleryGroups.map((group) => (
              <div key={group.id} className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1f2328] mb-6">{group.title}</h2>
                <div className="grid gap-6">
                  {group.galleries.map((g) => (
                    <DriveFolderCarousel
                      key={g.id}
                      title={g.title}
                      folderId={g.folderId}
                      folderUrl={g.folderUrl}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#f6f8fa] aspect-video md:h-[500px] md:aspect-auto flex items-center justify-center overflow-hidden rounded-t-xl">
              <img
                src={selectedImages[currentImageIndex]?.image ?? selectedItem.featured_image}
                alt={selectedImages[currentImageIndex]?.caption ?? selectedItem.title}
                className="w-full h-full object-cover"
              />

              {selectedImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1f2328] rounded-full p-2 transition-all"
                    aria-label="รูปก่อนหน้า"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1f2328] rounded-full p-2 transition-all"
                    aria-label="รูปถัดไป"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedImages.length}
                  </div>
                </>
              )}
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-4 gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-[#1f2328] mb-2">{selectedItem.title}</h2>
                  <span className={`inline-block ${getBadgeClass(selectedItem.category)} text-white text-xs font-bold px-3 py-1 rounded-md`}>
                    {selectedItem.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-[#656d76] hover:text-[#1f2328] text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-[#656d76] text-lg mb-6">{selectedItem.description}</p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {selectedItem.location && (
                  <div className="flex items-center gap-3 p-3 bg-[#f6f8fa] rounded-lg">
                    <MapPin className="w-5 h-5 text-[#0969da]" />
                    <div>
                      <p className="text-[#656d76] text-xs">สถานที่</p>
                      <p className="text-[#1f2328] font-semibold">{selectedItem.location}</p>
                    </div>
                  </div>
                )}
                {selectedItem.date && (
                  <div className="flex items-center gap-3 p-3 bg-[#f6f8fa] rounded-lg">
                    <Calendar className="w-5 h-5 text-[#0969da]" />
                    <div>
                      <p className="text-[#656d76] text-xs">วันที่</p>
                      <p className="text-[#1f2328] font-semibold">{new Date(selectedItem.date).toLocaleDateString("th-TH")}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedImages.length > 1 && (
                <div className="mb-6">
                  <p className="text-[#656d76] text-sm font-semibold mb-3">รูปภาพเพิ่มเติม</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {selectedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx ? "border-[#0969da]" : "border-[#d0d7de]"
                        }`}
                      >
                        <img src={img.image} alt={img.caption || `รูปที่ ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
