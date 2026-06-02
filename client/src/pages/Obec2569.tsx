import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { obec2569Items, type ObecPriceItem, type ObecPriceType } from "@/data/obec2569";
import { useMemo, useState } from "react";

function formatTHB(value: number) {
  const isInt = Math.abs(value - Math.round(value)) < 0.0000001;
  if (isInt) return new Intl.NumberFormat("th-TH").format(Math.round(value));
  return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function calcChange(price69: number, price68: number) {
  const delta = price69 - price68;
  const pct = price68 === 0 ? 0 : (delta / price68) * 100;
  return { delta, pct };
}

export default function Obec2569() {
  const [type, setType] = useState<ObecPriceType>("material");
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [calcYear, setCalcYear] = useState<"69" | "68">("69");
  const [showCompare, setShowCompare] = useState(true);

  const groups = useMemo(() => {
    const items = obec2569Items.filter((i) => i.type === type);
    return Array.from(new Set(items.map((i) => i.group)));
  }, [type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return obec2569Items
      .filter((i) => i.type === type)
      .filter((i) => (group === "all" ? true : i.group === group))
      .filter((i) => (q ? i.name.toLowerCase().includes(q) : true));
  }, [type, group, query]);

  const selected: ObecPriceItem | null = useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? (filtered[0] ?? null),
    [filtered, selectedId]
  );

  const selectedQty = selected ? qty[selected.id] ?? 1 : 0;
  const unitPrice = selected ? (calcYear === "69" ? selected.price69 : selected.price68) : 0;
  const selectedTotal = selected ? selectedQty * unitPrice : 0;

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
                    Price Update • 2569
                  </div>
                  <h1 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">
                    อัปเดตราคา “วัสดุก่อสร้าง & ค่าแรง” ปี 2569
                  </h1>
                  <p className="mt-3 text-white/75 max-w-3xl">
                    ค้นหา + เทียบปี 2568 + ใส่จำนวนเพื่อคำนวณยอดรวมแบบเร็ว (ราคากลาง ไม่รวม VAT/ขนส่ง)
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-2 text-xs text-white/60">
                <div>หมายเหตุ: หน้านี้ใช้ชุดข้อมูล “ตัวอย่าง” เพื่อทำเครื่องมือเช็คแบบง่าย ราคากลางยังไม่รวม VAT/ค่าขนส่ง และอาจต่างตามพื้นที่</div>
              </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="p-6 md:p-8">
              <div className="grid lg:grid-cols-[440px_1fr] gap-6 items-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-bold">ตัวกรอง</div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setType("material");
                        setGroup("all");
                        setSelectedId("");
                      }}
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
                      onClick={() => {
                        setType("labor");
                        setGroup("all");
                        setSelectedId("");
                      }}
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

                  <div className="mt-3 grid gap-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="ค้นหา เช่น ปูน, ทราย, ท่อ PVC, ไม้แบบ..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                    />

                    <select
                      value={calcYear}
                      onChange={(e) => setCalcYear(e.target.value === "68" ? "68" : "69")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="69">คำนวณจากราคา ปี 2569</option>
                      <option value="68">คำนวณจากราคา ปี 2568</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowCompare((p) => !p)}
                      className={[
                        "w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left",
                        showCompare ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {showCompare ? "แสดงเทียบปี 2568: เปิด" : "แสดงเทียบปี 2568: ปิด"}
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-white/60">กลุ่ม</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setGroup("all")}
                        className={[
                          "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                          group === "all" ? "bg-white text-[#0b1020] border-white" : "bg-white/5 text-white border-white/10 hover:bg-white/10",
                        ].join(" ")}
                      >
                        ทั้งหมด
                      </button>
                      {groups.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGroup(g)}
                          className={[
                            "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                            group === g ? "bg-white text-[#0b1020] border-white" : "bg-white/5 text-white border-white/10 hover:bg-white/10",
                          ].join(" ")}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/60">
                    <div>รายการที่พบ: {filtered.length}</div>
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

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                    <div className="border border-white/10 rounded-2xl overflow-hidden">
                      <div className="bg-white/5 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm font-bold">รายการ</div>
                        <div className="text-xs text-white/60">คลิกเพื่อดูรายละเอียด</div>
                      </div>
                      <div className="max-h-[560px] overflow-auto divide-y divide-white/10">
                        {filtered.map((i) => {
                          const isActive = selected?.id === i.id;
                          const price = calcYear === "69" ? i.price69 : i.price68;
                          const { delta, pct } = calcChange(i.price69, i.price68);
                          const deltaText = delta === 0 ? "0" : `${delta > 0 ? "+" : ""}${formatTHB(delta)}`;
                          const pctText = pct === 0 ? "0%" : `${pct > 0 ? "+" : ""}${formatTHB(pct)}%`;

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
                                  <div className="text-sm font-semibold leading-snug whitespace-normal break-words">{i.name}</div>
                                  <div className="text-xs text-white/60 mt-1">
                                    {i.group} • {i.unit}
                                  </div>
                                  {showCompare ? (
                                    <div className="text-[11px] text-white/55 mt-1">
                                      เทียบปี 68: {deltaText} ({pctText})
                                    </div>
                                  ) : null}
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="text-sm font-bold">{formatTHB(price)}</div>
                                  <div className="text-[11px] text-white/60">บาท/{i.unit}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {!filtered.length ? (
                          <div className="px-4 py-10 text-center text-sm text-white/60">ไม่พบรายการที่ตรงกับเงื่อนไข</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-bold">รายละเอียด</div>
                      {selected ? (
                        <div className="mt-3 grid gap-3">
                          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                            <div className="text-sm font-semibold leading-snug whitespace-normal break-words">{selected.name}</div>
                            <div className="text-xs text-white/60 mt-1">
                              กลุ่ม: {selected.group} • หน่วย: {selected.unit}
                            </div>

                            <div className="mt-3 grid gap-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-white/60">ราคา ปี 2569</div>
                                <div className="text-sm font-bold">{formatTHB(selected.price69)}</div>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-xs text-white/60">ราคา ปี 2568</div>
                                <div className="text-sm font-bold">{formatTHB(selected.price68)}</div>
                              </div>
                            </div>

                            <div className="mt-3 flex items-end justify-between gap-3">
                              <div>
                                <div className="text-xs text-white/60">คำนวณจากปี</div>
                                <div className="text-2xl font-extrabold leading-none">{calcYear === "69" ? "2569" : "2568"}</div>
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
                            ราคากลางเป็นตัวเลขอ้างอิง (ยังไม่รวม VAT/ค่าขนส่ง/ความแตกต่างรายจังหวัด) แนะนำตรวจสอบราคาหน้างานก่อนทำสัญญา
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-white/60">ยังไม่มีรายการให้แสดง</div>
                      )}
                    </div>
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
