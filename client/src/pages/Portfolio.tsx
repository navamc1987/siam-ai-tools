/*
 * Portfolio/Gallery Page
 * Displays project portfolio from Decap CMS
 */
import { useEffect, useState } from "react";
import { ChevronRight, MapPin, Calendar, ExternalLink } from "lucide-react";

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

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    "ทั้งหมด",
    "ต่อเติมและรีโนเวท",
    "ติดตั้งโซล่าเซลล์",
    "ระบบไฟฟ้า",
    "ระบบแสงสว่าง",
    "ระบบ CCTV",
    "อื่น ๆ",
  ];

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        // ดึงไฟล์ Markdown ทั้งหมดจากโฟลเดอร์ portfolio
        const response = await fetch("/api/portfolio");
        if (response.ok) {
          const items = await response.json();
          setPortfolioItems(items.filter((item: PortfolioItem) => item.published !== false));
        } else {
          // ถ้า API ไม่พร้อม ให้แสดงข้อมูลตัวอย่าง
          setPortfolioItems(samplePortfolioData);
        }
      } catch (error) {
        console.log("Loading sample portfolio data...");
        setPortfolioItems(samplePortfolioData);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const filteredItems =
    selectedCategory === "ทั้งหมด"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === selectedCategory);

  const handleNextImage = () => {
    if (selectedItem?.gallery) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedItem.gallery!.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedItem?.gallery) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + selectedItem.gallery!.length) % selectedItem.gallery!.length
      );
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center pt-24 pb-16 bg-gradient-to-br from-[#1A1A2E] to-[#0f0f1e]">
        <div className="absolute inset-0 hex-pattern opacity-30" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">ผลงานของเรา</h1>
            <p className="text-white/70 text-lg">
              ชมผลงานโครงการต่อเติม รีโนเวท ติดตั้งโซล่าเซลล์ และระบบไฟฟ้าของเราที่สำเร็จจากลูกค้าต่างๆ
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-white">
        <div className="container">
          {/* Category Filter */}
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-[#656d76]">กำลังโหลดผลงาน...</p>
            </div>
          )}

          {/* Portfolio Grid */}
          {!loading && filteredItems.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedItem(item);
                    setCurrentImageIndex(0);
                  }}
                  className="group cursor-pointer bg-white border border-[#d0d7de] rounded-lg overflow-hidden hover:border-[#0969da] hover:shadow-lg transition-all"
                >
                  {/* Featured Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#f6f8fa]">
                    <img
                      src={item.featured_image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#0969da] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-[#1f2328] font-bold text-lg mb-2 group-hover:text-[#0969da] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#656d76] text-sm line-clamp-2 mb-4">
                      {item.description || "ไม่มีรายละเอียด"}
                    </p>

                    {/* Meta Info */}
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

                    {/* View Button */}
                    <button className="mt-4 w-full py-2 border border-[#d0d7de] rounded-md text-[#1f2328] font-semibold text-sm hover:bg-[#f6f8fa] transition-colors flex items-center justify-center gap-2">
                      ดูรายละเอียด
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#656d76] text-lg">ยังไม่มีผลงานในหมวดหมู่นี้</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal for Detailed View */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gallery Viewer */}
            <div className="relative bg-[#f6f8fa] aspect-video md:aspect-auto md:h-[500px] flex items-center justify-center overflow-hidden">
              <img
                src={
                  selectedItem.gallery && selectedItem.gallery.length > 0
                    ? selectedItem.gallery[currentImageIndex].image
                    : selectedItem.featured_image
                }
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />

              {/* Gallery Navigation */}
              {selectedItem.gallery && selectedItem.gallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1f2328] rounded-full p-2 transition-all"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1f2328] rounded-full p-2 transition-all"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedItem.gallery.length}
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#1f2328] mb-2">{selectedItem.title}</h2>
                  <span className="inline-block bg-[#0969da] text-white text-xs font-bold px-3 py-1 rounded-md">
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

              {/* Gallery Thumbnails */}
              {selectedItem.gallery && selectedItem.gallery.length > 0 && (
                <div className="border-t border-[#d0d7de] pt-6">
                  <h3 className="font-bold text-[#1f2328] mb-4">แกลเลอรี่</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    <button
                      onClick={() => setCurrentImageIndex(-1)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        currentImageIndex === -1
                          ? "border-[#0969da]"
                          : "border-[#d0d7de] hover:border-[#0969da]"
                      }`}
                    >
                      <img
                        src={selectedItem.featured_image}
                        alt="Featured"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {selectedItem.gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx
                            ? "border-[#0969da]"
                            : "border-[#d0d7de] hover:border-[#0969da]"
                        }`}
                      >
                        <img src={img.image} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Link Button */}
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

// Sample Portfolio Data (สำหรับการทดสอบ)
const samplePortfolioData: PortfolioItem[] = [
  {
    title: "รีโนเวทห้องน้ำ โครงการ A",
    category: "ต่อเติมและรีโนเวท",
    description: "การรีโนเวทห้องน้ำแบบสมบูรณ์พร้อมระบบท่อน้ำและไฟฟ้าใหม่",
    location: "ชลบุรี",
    date: "2024-01-15",
    featured_image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
        caption: "มุมมองทั่วไป",
      },
      {
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
        caption: "ส่วนอ่างล้างมือ",
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
    featured_image: "https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=600&q=80",
    published: true,
  },
  {
    title: "ระบบไฟฟ้าโรงงาน",
    category: "ระบบไฟฟ้า",
    description: "ติดตั้งระบบไฟฟ้าแรงสูง 3 เฟส พร้อมตู้ MDB และระบบสายดิน",
    location: "ชลบุรี",
    date: "2024-03-10",
    featured_image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80",
    published: true,
  },
];
