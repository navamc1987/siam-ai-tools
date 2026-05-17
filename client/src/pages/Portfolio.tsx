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
  // ===== หมวด: ต่อเติมและรีโนเวท =====
  {
    title: "โครงการรีโนเวทอาคารพาณิชย์",
    category: "ต่อเติมและรีโนเวท",
    description: "ปรับปรุงโครงสร้างและตกแต่งภายในอาคารพาณิชย์ให้ทันสมัย",
    location: "ชลบุรี",
    date: "2024-01-15",
    featured_image: "/images/portfolio/renovate/commercial_featured_final.jpg",
    gallery: [
      {
        image: "/images/portfolio/renovate/481199416_1359929375443853_2204846716806201200_n.jpg",
        caption: "งานรีโนเวทอาคารพาณิชย์ด้านหน้า",
      },
      {
        image: "/images/portfolio/renovate/480467107_1359928205443970_6873116217130309152_n.jpg",
        caption: "งานตกแต่งภายในอาคาร",
      },
      {
        image: "/images/portfolio/renovate/480555186_1359947458775378_4041487267011488691_n.jpg",
        caption: "งานระบบไฟฟ้าและแสงสว่าง",
      },
      {
        image: "/images/portfolio/renovate/484089211_1374739840629473_1199222055835335086_n.jpg",
        caption: "งานผนังและพื้น",
      },
      {
        image: "/images/portfolio/renovate/480439796_1356245002478957_6764352336728129585_n.jpg",
        caption: "งานประตูและหน้าต่าง",
      },
      {
        image: "/images/portfolio/renovate/492574607_1409325017170955_5439319349492860166_n.jpg",
        caption: "ภาพรวมโครงการเสร็จสิ้น",
      },
    ],
    published: true,
  },
  {
    title: "งานรีโนเวทบ้านพักอาศัย",
    category: "ต่อเติมและรีโนเวท",
    description: "รีโนเวทห้องนั่งเล่นและห้องครัวสไตล์มินิมอล",
    location: "นครสวรรค์",
    date: "2024-02-10",
    featured_image: "/images/portfolio/renovate/residential_featured.jpg",
    gallery: [
      {
        image: "/images/portfolio/renovate/480317863_1359929185443872_6946517117472118898_n.jpg",
        caption: "ห้องนั่งเล่นหลังรีโนเวท",
      },
      {
        image: "/images/portfolio/renovate/483950596_1374739623962828_3936861051991646482_n.jpg",
        caption: "ห้องครัวสไตล์มินิมอล",
      },
      {
        image: "/images/portfolio/renovate/480460556_1359928275443963_5190369852008110952_n.jpg",
        caption: "งานตกแต่งและเฟอร์นิเจอร์",
      },
      {
        image: "/images/portfolio/renovate/488049306_1389596519143805_1606307762565975541_n.jpg",
        caption: "งานระบบน้ำและท่อ",
      },
      {
        image: "/images/portfolio/renovate/494049703_1409324237171033_4864961002848039287_n.jpg",
        caption: "งานไฟฟ้าและแสงสว่าง",
      },
      {
        image: "/images/portfolio/renovate/481066215_1359928268777297_801345504377277401_n.jpg",
        caption: "ภาพรวมบ้านพักเสร็จสิ้น",
      },
    ],
    published: true,
  },
  {
    title: "งานต่อเติมพื้นที่อเนกประสงค์",
    category: "ต่อเติมและรีโนเวท",
    description: "ต่อเติมโรงจอดรถและพื้นที่ซักล้างหลังบ้าน",
    location: "ชลบุรี",
    date: "2024-03-05",
    featured_image: "/images/portfolio/renovate/extension_featured.jpg",
    gallery: [
      {
        image: "/images/portfolio/renovate/480713289_1359928382110619_9107853437693770149_n.jpg",
        caption: "โรงจอดรถต่อเติม",
      },
      {
        image: "/images/portfolio/renovate/480307506_1359947492108708_8290198814217416459_n.jpg",
        caption: "พื้นที่ซักล้างหลังบ้าน",
      },
      {
        image: "/images/portfolio/renovate/480871367_1359929412110516_5353576956154485433_n.jpg",
        caption: "งานระบบท่อและระบายน้ำ",
      },
      {
        image: "/images/portfolio/renovate/481177569_1364545621648895_1933032333680324380_n.jpg",
        caption: "งานไฟฟ้าและแสงสว่าง",
      },
      {
        image: "/images/portfolio/renovate/480745872_1359928128777311_7923583716871975946_n.jpg",
        caption: "งานผนังและพื้น",
      },
      {
        image: "/images/portfolio/renovate/487802706_1389594809143976_7032018464623556443_n.jpg",
        caption: "ภาพรวมพื้นที่ต่อเติมเสร็จสิ้น",
      },
    ],
    published: true,
  },
  // ===== หมวด: ติดตั้งโซล่าเซลล์ =====
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
  // ===== หมวด: ระบบไฟฟ้า =====
  {
    title: "ระบบไฟฟ้าโรงงาน",
    category: "ระบบไฟฟ้า",
    description: "ติดตั้งระบบไฟฟ้าแรงสูง 3 เฟส พร้อมตู้ MDB และระบบสายดิน",
    location: "ชลบุรี",
    date: "2024-03-10",
    featured_image: ""/images/portfolio/electrical/factory_featured.jpg"",
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
  // ===== หมวด: ระบบแสงสว่าง =====
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
  // ===== หมวด: ระบบ CCTV =====
  {
    title: "ระบบกล้องวงจรปิด IP Camera ร้านค้า",
    category: "ระบบ CCTV",
    description: "ติดตั้งระบบกล้อง IP Camera พร้อมระบบบันทึกและการดูภาพผ่านมือถือแบบ Real-time",
    location: "บรรพตพิสัย",
    date: "2024-05-05",
    featured_image: "/images/portfolio/cctv/186272_0.jpg",
    gallery: [
      {
        image: "/images/portfolio/cctv/186272_0.jpg",
        caption: "กล้อง IP Camera ติดตั้งหน้าร้านค้า",
      },
      {
        image: "/images/portfolio/cctv/186273_0.jpg",
        caption: "ระบบบันทึกและการจัดการวิดีโอ",
      },
      {
        image: "/images/portfolio/cctv/186274_0.jpg",
        caption: "ระบบมอนิเตอร์และควบคุม",
      },
      {
        image: "/images/portfolio/cctv/186275_0.jpg",
        caption: "การติดตั้งสายเคเบิลและอุปกรณ์",
      },
      {
        image: "/images/portfolio/cctv/186276_0.jpg",
        caption: "ภาพรวมระบบ CCTV เสร็จสิ้น",
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
    </>
  );
}
