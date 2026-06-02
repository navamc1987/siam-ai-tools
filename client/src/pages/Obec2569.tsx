import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { obec2569Items, obec2569Source, type ObecPriceItem, type ObecPriceType, type ObecTag } from "@/data/obec2569";
import { useMemo, useState } from "react";

function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH").format(Math.round(value));
}

const tagLabel: Record<ObecTag, string> = {
  foundation: "ฐานราก",
  structure: "โครงสร้าง",
  wall: "ผนัง",
  roof: "หลังคา",
  paint: "งานสี",
  electrical: "ไฟฟ้า",
  plumbing: "สุขาภิบาล",
  general: "ทั่วไป",
};

export default function Obec2569() {
  const [type, setType] = useState<ObecPriceType>("material");
  const [activeTag, setActiveTag] = useState<ObecTag | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [qty, setQty] = useState<Record<string, number>>({});

  const categories = useMemo(() => {
    const items = obec2569Items.filter((i) => i.type === type);
    return Array.from(new Set(items.map((i) => i.category)));
  }, [type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return obec2569Items
      .filter((i) => i.type === type)
      .filter((i) => (category === "all" ? true : i.category === category))
      .filter((i) => (activeTag === "all" ? true : i.tags.includes(activeTag)))
      .filter((i) => (q ? i.name.toLowerCase().includes(q) : true));
  }, [type, category, activeTag, query]);

  const selected: ObecPriceItem | null = useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? (filtered[0] ?? null),
    [filtered, selectedId]
  );

  const selectedQty = selected ? qty[selected.id] ?? 1 : 0;
  const selectedTotal = selected ? selectedQty * selected.price : 0;

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <Navbar />

      <section className="pt-24 pb-10">
        <div className="container">
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#0e1633] to-[#0b1020]">
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white/70">
                    Price Check • OBEC 2569
                  </div>
                  <h1 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">
                    สำรวจราคากลางวัสดุ & ค่าแรง (สพฐ. ปีงบประมาณ 2569)
                  </h1>
                  <p className="mt-3 text-white/75 max-w-3xl">
                    เครื่องมือเช็คแบบเร็ว: เลือกจุดบนแบบบ้าน 2D → ค้นหารายการ → ใส่จำนวน → ดูราคาแบบคร่าว ๆ
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={obec2569Source.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-semibold transition-all"
                  >
                    เปิดไฟล์บัญชีราคาฯ (PDF)
                  </a>
                  <a
                    href={obec2569Source.articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all"
                  >
                    แหล่งอ้างอิง
                  </a>
                </div>
              </div>

              <div className="mt-6 grid gap-2 text-xs text-white/60">
                <div>หมายเหตุ: รายการและราคาในหน้านี้เป็นตัวอย่างเพื่อเช็คแบบง่าย ควรตรวจสอบราคาจริงกับบัญชี สพฐ. และราคาหน้างานอีกครั้ง</div>
              </div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="p-6 md:p-8">
              <div className="grid lg:grid-cols-[520px_1fr] gap-6 items-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold">แบบบ้านตัวอย่าง (3D)</div>
                      <div className="text-xs text-white/60 mt-1">คลิกส่วนของบ้านเพื่อกรองรายการ (หลังคา/ผนัง/ฐานราก)</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTag("all")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
                    >
                      ล้างตัวกรอง
                    </button>
                  </div>

                  <div className="mt-4 relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f1b3f] to-[#0b1020]">
                    <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 30% 20%, rgba(52,211,153,0.25), transparent 55%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.25), transparent 55%)" }} />
                    <div className="relative p-5">
                      <div className="relative w-full aspect-[4/3]">
                        <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-[92%] h-[88%] max-w-[520px]">
                            <div
                              className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[78%] h-[30%] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0"
                              style={{ transform: "skewX(-18deg) rotate(-2deg)" }}
                            />
                            <div
                              className="absolute left-1/2 top-[38%] -translate-x-1/2 w-[76%] h-[34%] rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/0"
                              style={{ transform: "skewX(-8deg) rotate(0deg)" }}
                            />
                            <div
                              className="absolute left-1/2 top-[72%] -translate-x-1/2 w-[82%] h-[16%] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0"
                              style={{ transform: "skewX(-10deg) rotate(0deg)" }}
                            />

                            <button
                              type="button"
                              onClick={() => setActiveTag("roof")}
                              className={[
                                "absolute left-1/2 top-[12%] -translate-x-1/2 w-[78%] h-[28%] rounded-2xl border transition-all backdrop-blur-[2px]",
                                activeTag === "roof"
                                  ? "border-[#22c55e] bg-gradient-to-br from-[#22c55e]/25 to-[#22c55e]/5 shadow-[0_0_0_1px_rgba(34,197,94,0.25),0_10px_30px_rgba(34,197,94,0.15)]"
                                  : "border-white/10 bg-gradient-to-br from-white/10 to-white/0 hover:border-white/25 hover:bg-white/10",
                              ].join(" ")}
                              style={{ transform: "translateX(-50%) skewX(-18deg) rotate(-2deg)" }}
                            >
                              <div
                                className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-extrabold"
                                style={{ transform: "skewX(18deg) rotate(2deg)" }}
                              >
                                หลังคา
                                <span className="text-xs font-semibold text-white/60">(Roof)</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTag("wall")}
                              className={[
                                "absolute left-1/2 top-[40%] -translate-x-1/2 w-[76%] h-[34%] rounded-2xl border transition-all backdrop-blur-[2px]",
                                activeTag === "wall"
                                  ? "border-[#60a5fa] bg-gradient-to-br from-[#60a5fa]/25 to-[#60a5fa]/5 shadow-[0_0_0_1px_rgba(96,165,250,0.25),0_10px_30px_rgba(96,165,250,0.15)]"
                                  : "border-white/10 bg-gradient-to-br from-white/10 to-white/0 hover:border-white/25 hover:bg-white/10",
                              ].join(" ")}
                              style={{ transform: "translateX(-50%) skewX(-8deg) rotate(0deg)" }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-extrabold">
                                ผนัง
                                <span className="text-xs font-semibold text-white/60">(Wall)</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTag("foundation")}
                              className={[
                                "absolute left-1/2 top-[72%] -translate-x-1/2 w-[82%] h-[16%] rounded-2xl border transition-all backdrop-blur-[2px]",
                                activeTag === "foundation"
                                  ? "border-[#f59e0b] bg-gradient-to-br from-[#f59e0b]/25 to-[#f59e0b]/5 shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_10px_30px_rgba(245,158,11,0.15)]"
                                  : "border-white/10 bg-gradient-to-br from-white/10 to-white/0 hover:border-white/25 hover:bg-white/10",
                              ].join(" ")}
                              style={{ transform: "translateX(-50%) skewX(-10deg) rotate(0deg)" }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-extrabold">
                                ฐานราก
                                <span className="text-xs font-semibold text-white/60">(Foundation)</span>
                              </div>
                            </button>

                            <div className="absolute left-4 top-4 flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveTag("electrical")}
                                className={[
                                  "px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all",
                                  activeTag === "electrical"
                                    ? "border-[#a78bfa] bg-[#a78bfa]/20"
                                    : "border-white/10 bg-white/5 hover:bg-white/10",
                                ].join(" ")}
                              >
                                ไฟฟ้า
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTag("plumbing")}
                                className={[
                                  "px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all",
                                  activeTag === "plumbing"
                                    ? "border-[#38bdf8] bg-[#38bdf8]/20"
                                    : "border-white/10 bg-white/5 hover:bg-white/10",
                                ].join(" ")}
                              >
                                สุขาภิบาล
                              </button>
                            </div>

                            <div className="absolute right-4 bottom-4 text-xs text-white/70">
                              กรอง:{" "}
                              <span className="text-white font-semibold">
                                {activeTag === "all" ? "ทั้งหมด" : tagLabel[activeTag]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(
                      [
                        ["foundation", "ฐานราก"],
                        ["structure", "โครงสร้าง"],
                        ["wall", "ผนัง"],
                        ["roof", "หลังคา"],
                        ["paint", "งานสี"],
                        ["electrical", "ไฟฟ้า"],
                        ["plumbing", "สุขาภิบาล"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTag(key)}
                        className={[
                          "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                          activeTag === key
                            ? "bg-white text-[#0b1020] border-white"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setType("material")}
                        className={[
                          "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                          type === "material"
                            ? "bg-white text-[#0b1020] border-white"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10",
                        ].join(" ")}
                      >
                        วัสดุ
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("labor")}
                        className={[
                          "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                          type === "labor"
                            ? "bg-white text-[#0b1020] border-white"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10",
                        ].join(" ")}
                      >
                        ค่าแรง
                      </button>
                    </div>

                    <div className="grid md:grid-cols-[1fr_220px] gap-2 w-full md:max-w-[520px]">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ค้นหารายการ เช่น ปูน, เหล็ก, ค่าแรง..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                      />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                      >
                        <option value="all">ทุกหมวด</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 grid lg:grid-cols-[1fr_280px] gap-4">
                    <div className="border border-white/10 rounded-2xl overflow-hidden">
                      <div className="bg-white/5 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm font-bold">
                          รายการ ({filtered.length})
                        </div>
                        <div className="text-xs text-white/60">
                          คลิกเพื่อดูรายละเอียด
                        </div>
                      </div>
                      <div className="max-h-[520px] overflow-auto divide-y divide-white/10">
                        {filtered.map((i) => {
                          const isActive = selected?.id === i.id;
                          return (
                            <button
                              key={i.id}
                              type="button"
                              onClick={() => setSelectedId(i.id)}
                              className={[
                                "w-full text-left px-4 py-3 transition-all",
                                isActive ? "bg-white/10" : "hover:bg-white/5",
                              ].join(" ")}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold leading-snug whitespace-normal break-words">
                                    {i.name}
                                  </div>
                                  <div className="text-xs text-white/60 mt-1">
                                    {i.category} • {tagLabel[i.tags[0] ?? "general"]} • {i.unit}
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="text-sm font-bold">{formatTHB(i.price)}</div>
                                  <div className="text-[11px] text-white/60">บาท/{i.unit}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {!filtered.length ? (
                          <div className="px-4 py-10 text-center text-sm text-white/60">
                            ไม่พบรายการที่ตรงกับเงื่อนไข
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-bold">รายละเอียด</div>
                      {selected ? (
                        <div className="mt-3 grid gap-3">
                          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                            <div className="text-sm font-semibold leading-snug whitespace-normal break-words">
                              {selected.name}
                            </div>
                            <div className="text-xs text-white/60 mt-1">
                              หมวด: {selected.category} • ใช้ใน: {selected.tags.map((t) => tagLabel[t]).join(", ")}
                            </div>
                            <div className="mt-3 flex items-end justify-between gap-3">
                              <div>
                                <div className="text-xs text-white/60">ราคาอ้างอิง</div>
                                <div className="text-2xl font-extrabold leading-none">{formatTHB(selected.price)}</div>
                                <div className="text-xs text-white/60 mt-1">บาท/{selected.unit}</div>
                              </div>
                              <div className="grid gap-2 w-[140px]">
                                <div className="text-xs text-white/60">จำนวน</div>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={Number.isFinite(selectedQty) ? selectedQty : 1}
                                  onChange={(e) =>
                                    setQty((p) => ({
                                      ...p,
                                      [selected.id]: Number(e.target.value) || 0,
                                    }))
                                  }
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-white/30"
                                />
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="text-xs text-white/60">รวม</div>
                              <div className="text-lg font-extrabold">{formatTHB(selectedTotal)} บาท</div>
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 leading-relaxed">
                            ใช้เพื่อ “ตรวจเช็ค” ราคากลางแบบเร็ว หากต้องทำเอกสารทางราชการ แนะนำอ้างอิงเลขหน้า/หมวดจาก PDF
                            และตรวจสอบราคาจังหวัด/ช่วงเวลา
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-white/60">ยังไม่มีรายการให้แสดง</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                    <div>
                      Tip: เลือก “หลังคา/ผนัง/ฐานราก” จากแบบ 2D เพื่อกรองรายการให้ตรงส่วนงานเร็วขึ้น
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQty({});
                        setSelectedId("");
                      }}
                      className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white"
                    >
                      รีเซ็ตจำนวน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
