/*
 * Portfolio/Gallery Page
 * Static portfolio gallery grouped by service category.
 */
import { useMemo, useState } from "react";
import { Calendar, ChevronRight, ExternalLink, MapPin } from "lucide-react";

interface GalleryImage {
  image: string;
  caption?: string;
}

interface PortfolioItem {
  title: string;
  category: string;
  description?: string;
  location?: string;
  date?: string;
  featured_image: string;
  gallery?: GalleryImage[];
  link?: string;
  published: boolean;
}

const categories = [
  "ทั้งหมด",
  "ต่อเติมและรีโนเวท",
  "ติดตั้งโซล่าเซลล์",
  "ระบบไฟฟ้า",
  "ระบบแสงสว่าง",
  "ระบบ CCTV",
  "อื่น ๆ",
];

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

const portfolioItems: PortfolioItem[] = [
  {
    title: "รีโนเวทห้องน้ำ โครงการ A",
    category: "ต่อเติมและรีโนเวท",
    description: "การรีโนเวทห้องน้ำแบบสมบูรณ์พร้อมระบบท่อน้ำและไฟฟ้าใหม่",
    location: "ชลบุรี",
    date: "2024-01-15",
    featured_image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&auto=format&fit=crop&q=85",
        caption: "งานห้องน้ำและสุขภัณฑ์",
      },
      {
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=85",
        caption: "งานระบบน้ำและพื้นที่ใช้งาน",
      },
    ],
    published: true,
  },
  {
    title: "ติดตั้งโซล่าเซลล์ บ้านพัก",
    category: "ติดตั้งโซล่าเซลล์",
    description: "ติดตั้งแผงโซล่าเซลล์ 10 kW พร้อมระบบ Inverter และแบตเตอรี่",
    location: "นครสวรรค์",
    date: "2024-02-20",
    featured_image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=1200&auto=format&fit=crop&q=85",
        caption: "แผงโซลาร์เซลล์บนหลังคา",
      },
      {
        image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=1200&auto=format&fit=crop&q=85",
        caption: "ระบบพลังงานแสงอาทิตย์",
      },
    ],
    published: true,
  },
  {
    title: "ระบบไฟฟ้าโรงงาน",
    category: "ระบบไฟฟ้า",
    description: "ติดตั้งระบบไฟฟ้าแรงสูง 3 เฟส พร้อมตู้ MDB และระบบสายดิน",
    location: "ชลบุรี",
    date: "2024-03-10",
    featured_image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&auto=format&fit=crop&q=85",
        caption: "ตู้ควบคุมและระบบไฟฟ้า",
      },
      {
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=85",
        caption: "งานตรวจเช็กระบบไฟฟ้าอุตสาหกรรม",
      },
    ],
    published: true,
  },
  {
    title: "ติดตั้งระบบแสงสว่างอาคาร",
    category: "ระบบแสงสว่าง",
    description: "ออกแบบและติดตั้งไฟ LED สำหรับพื้นที่สำนักงานและอาคารพาณิชย์",
    location: "นครสวรรค์",
    date: "2024-04-18",
    featured_image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=85",
        caption: "โคมไฟ LED ภายในอาคาร",
      },
    ],
    published: true,
  },
  {
    title: "ติดตั้งกล้องวงจรปิดภายในร้านค้า",
    category: "ระบบ CCTV",
    description: "ติดตั้งกล้อง IP Camera พร้อมตั้งค่าระบบบันทึกและดูภาพผ่านมือถือ",
    location: "บรรพตพิสัย",
    date: "2024-05-05",
    featured_image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&auto=format&fit=crop&q=85",
        caption: "กล้องรักษาความปลอดภัย",
      },
      {
        image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1200&auto=format&fit=crop&q=85",
        caption: "งานระบบและอุปกรณ์ควบคุม",
      },
    ],
    published: true,
  },
];

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
    <>
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
          <div className="flex flex-wrap gap-3 mb-12 justify-center md:justify-start">
            {categories.map((cat) => (
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
                  aria-label="ปิดรายละเอียด"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  {selectedItem.description && (
                    <>
                      <h3 className="font-bold text-[#1f2328] mb-2">รายละเอียด</h3>
                      <p className="text-[#656d76] leading-relaxed">{selectedItem.description}</p>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  {selectedItem.location && (
                    <div>
                      <h4 className="font-bold text-[#1f2328] mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        สถานที่
                      </h4>
                      <p className="text-[#656d76]">{selectedItem.location}</p>
                    </div>
                  )}
                  {selectedItem.date && (
                    <div>
                      <h4 className="font-bold text-[#1f2328] mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        วันที่เสร็จสิ้น
                      </h4>
                      <p className="text-[#656d76]">
                        {new Date(selectedItem.date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedImages.length > 1 && (
                <div className="border-t border-[#d0d7de] pt-6">
                  <h3 className="font-bold text-[#1f2328] mb-4">แกลเลอรี่</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedImages.map((img, idx) => (
                      <button
                        key={`${img.image}-${idx}`}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx
                            ? "border-[#0969da]"
                            : "border-[#d0d7de] hover:border-[#0969da]"
                        }`}
                      >
                        <img src={img.image} alt={img.caption ?? `Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.link && (
                <div className="mt-6 pt-6 border-t border-[#d0d7de]">
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0969da] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#0860ca] transition-colors"
                  >
                    ดูเพิ่มเติม
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
