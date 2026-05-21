/*
 * Portfolio/Gallery Page
 * Static portfolio gallery grouped by service category.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DriveSlideshow from "@/components/DriveSlideshow";

export default function Portfolio() {
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
          <DriveSlideshow />
        </div>
      </section>
      <Footer />
    </div>
  );
}
