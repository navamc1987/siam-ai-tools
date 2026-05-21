/*
 * Portfolio/Gallery Page
 * Static portfolio gallery grouped by service category.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { driveGalleryGroups } from "@/data/driveFolders";
import DriveFolderCarousel from "@/components/DriveFolderCarousel";

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
              แยกหมวดหมู่ผลงานจากอัลบั้ม Google Drive เพื่อให้เลือกดูรูปงานจริงได้ง่ายขึ้น
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          {driveGalleryGroups.map((group) => (
            <div key={group.id} className="mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1f2328] mb-6">{group.title}</h2>
              <div className="grid gap-6">
                {group.galleries.map((g) => (
                  <DriveFolderCarousel key={g.id} title={g.title} folderId={g.folderId} folderUrl={g.folderUrl} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
