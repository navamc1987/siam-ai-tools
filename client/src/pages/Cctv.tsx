import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { kstCctvSources, type KstBrand } from "@/data/kstCctvSources";
import { useEffect, useMemo, useState } from "react";

type KstProduct = {
  id: string;
  url: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
};

type KstCategoryResponse = {
  url: string;
  products: KstProduct[];
};

function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(text));
}

function parseChannels(name: string) {
  const m = name.match(/(\d+)\s*ช่อง/);
  if (m) return Number(m[1]);
  const m2 = name.match(/\b(\d+)\s*CH\b/i);
  if (m2) return Number(m2[1]);
  return null;
}

function parseHddTb(name: string) {
  const m = name.match(/(\d+)\s*TB/i);
  if (!m) return null;
  return Number(m[1]);
}

export default function Cctv() {
  const [brand, setBrand] = useState<KstBrand>("hikvision");
  const [cameraCount, setCameraCount] = useState<number>(4);
  const [nightMode, setNightMode] = useState<"ir" | "fullcolor">("ir");
  const [needMic, setNeedMic] = useState(true);
  const [needTalk, setNeedTalk] = useState(false);

  const [cameraQuery, setCameraQuery] = useState("");
  const [selectedCameraUrl, setSelectedCameraUrl] = useState<string>("");
  const [selectedNvrUrl, setSelectedNvrUrl] = useState<string>("");
  const [selectedHddUrl, setSelectedHddUrl] = useState<string>("");
  const [hddQty, setHddQty] = useState<number>(1);

  const [cablePerCameraM, setCablePerCameraM] = useState<number>(20);
  const [cableExtraPercent, setCableExtraPercent] = useState<number>(10);
  const [cableExtraMeters, setCableExtraMeters] = useState<number>(0);
  const [laborPerMeter, setLaborPerMeter] = useState<number>(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nvrProducts, setNvrProducts] = useState<KstProduct[]>([]);
  const [cameraProducts, setCameraProducts] = useState<KstProduct[]>([]);
  const [hddProducts, setHddProducts] = useState<KstProduct[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setNvrProducts([]);
        setCameraProducts([]);
        setHddProducts([]);
        setSelectedCameraUrl("");
        setSelectedNvrUrl("");
        setSelectedHddUrl("");

        const sources = kstCctvSources[brand];

        const fetchCategory = async (u: string) => {
          const res = await fetch(`/api/kst-category?url=${encodeURIComponent(u)}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(await res.text());
          return (await res.json()) as KstCategoryResponse;
        };

        const [nvrRes, ...cameraRes] = await Promise.all([
          fetchCategory(sources.nvr),
          ...sources.cameras.map((u) => fetchCategory(u)),
        ]);
        const hddRes = await Promise.all(sources.hdd.map((u) => fetchCategory(u)));

        setNvrProducts(nvrRes.products);
        setCameraProducts(cameraRes.flatMap((r) => r.products));
        setHddProducts(hddRes.flatMap((r) => r.products));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [brand]);

  const cameraFiltered = useMemo(() => {
    const q = cameraQuery.trim().toLowerCase();

    const micPatterns = [/ไมค์/i, /mic/i, /microphone/i];
    const talkPatterns = [/โต้ตอบ/i, /two[- ]?way/i, /talk/i, /active deterrence/i];
    const fullColorPatterns = [/full\s*color/i, /colorvu/i, /wizcolor/i, /colorhunter/i, /dual\s*light/i, /warm\s*light/i];
    const irPatterns = [/smart\s*ir/i, /\bir\b/i, /hybrid\s*light/i];

    return cameraProducts
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .filter((p) => (needMic ? matchesAny(p.name, micPatterns) : true))
      .filter((p) => (needTalk ? matchesAny(p.name, talkPatterns) : true))
      .filter((p) =>
        nightMode === "fullcolor"
          ? matchesAny(p.name, fullColorPatterns)
          : matchesAny(p.name, irPatterns) || !matchesAny(p.name, fullColorPatterns)
      )
      .filter((p) => (p.price ?? 0) > 0)
      .slice()
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }, [cameraProducts, cameraQuery, needMic, needTalk, nightMode]);

  const nvrFiltered = useMemo(() => {
    const needed = Math.max(1, Math.round(cameraCount || 0));
    return nvrProducts
      .filter((p) => (p.price ?? 0) > 0)
      .map((p) => ({ ...p, channels: parseChannels(p.name) }))
      .filter((p) => (p.channels ? p.channels >= needed : true))
      .slice()
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }, [nvrProducts, cameraCount]);

  const hddFiltered = useMemo(() => {
    return hddProducts
      .filter((p) => (p.price ?? 0) > 0)
      .map((p) => ({ ...p, tb: parseHddTb(p.name) }))
      .filter((p) => Boolean(p.tb))
      .slice()
      .sort((a, b) => (a.tb ?? 0) - (b.tb ?? 0));
  }, [hddProducts]);

  useEffect(() => {
    if (!selectedCameraUrl && cameraFiltered.length) setSelectedCameraUrl(cameraFiltered[0].url);
  }, [selectedCameraUrl, cameraFiltered]);

  useEffect(() => {
    if (!selectedNvrUrl && nvrFiltered.length) setSelectedNvrUrl(nvrFiltered[0].url);
  }, [selectedNvrUrl, nvrFiltered]);

  useEffect(() => {
    if (!selectedHddUrl && hddFiltered.length) setSelectedHddUrl(hddFiltered[0].url);
  }, [selectedHddUrl, hddFiltered]);

  const selectedCamera = useMemo(
    () => cameraProducts.find((p) => p.url === selectedCameraUrl) ?? null,
    [cameraProducts, selectedCameraUrl]
  );
  const selectedNvr = useMemo(
    () => nvrProducts.find((p) => p.url === selectedNvrUrl) ?? null,
    [nvrProducts, selectedNvrUrl]
  );
  const selectedHdd = useMemo(
    () => hddProducts.find((p) => p.url === selectedHddUrl) ?? null,
    [hddProducts, selectedHddUrl]
  );

  const totals = useMemo(() => {
    const cams = Math.max(0, Math.round(cameraCount || 0));
    const cameraSubtotal = (selectedCamera?.price ?? 0) * cams;
    const nvrSubtotal = selectedNvr?.price ?? 0;
    const hddSubtotal = (selectedHdd?.price ?? 0) * Math.max(0, Math.round(hddQty || 0));

    const baseCable = cams * Math.max(0, cablePerCameraM || 0);
    const cableWithExtra = baseCable * (1 + Math.max(0, cableExtraPercent || 0) / 100) + Math.max(0, cableExtraMeters || 0);
    const labor = cableWithExtra * Math.max(0, laborPerMeter || 0);

    const material = cameraSubtotal + nvrSubtotal + hddSubtotal;
    const total = material + labor;

    return {
      cams,
      baseCable,
      cableWithExtra,
      cameraSubtotal,
      nvrSubtotal,
      hddSubtotal,
      labor,
      material,
      total,
    };
  }, [
    cameraCount,
    selectedCamera?.price,
    selectedNvr?.price,
    selectedHdd?.price,
    hddQty,
    cablePerCameraM,
    cableExtraPercent,
    cableExtraMeters,
    laborPerMeter,
  ]);

  const handleContact = () => {
    const brandLabel =
      brand === "hikvision" ? "Hikvision" : brand === "dahua" ? "Dahua" : "Uniview";
    const message = [
      "ขอจัดสเปค/ประเมินกล้องวงจรปิด",
      "",
      `ยี่ห้อ: ${brandLabel}`,
      `จำนวนกล้อง: ${formatTHB(totals.cams)} ตัว`,
      `โหมดกลางคืน: ${nightMode === "fullcolor" ? "Full Color" : "IR"}`,
      `ไมค์: ${needMic ? "ต้องการ" : "ไม่จำเป็น"}`,
      `โต้ตอบ: ${needTalk ? "ต้องการ" : "ไม่จำเป็น"}`,
      "",
      `กล้อง: ${selectedCamera?.name ?? "-"}`,
      `เครื่องบันทึก: ${selectedNvr?.name ?? "-"}`,
      `HDD: ${selectedHdd?.name ?? "-"} x ${formatTHB(Math.max(0, Math.round(hddQty || 0)))} ลูก`,
      "",
      `ระยะสายเฉลี่ย: ${formatTHB(Math.max(0, cablePerCameraM || 0))} ม./จุด`,
      `เผื่อสาย: ${formatTHB(Math.max(0, cableExtraPercent || 0))}% + ${formatTHB(Math.max(0, cableExtraMeters || 0))} ม.`,
      `ระยะสายรวม: ${formatTHB(Math.round(totals.cableWithExtra))} ม.`,
      `ค่าแรงติดตั้ง: ${formatTHB(Math.round(laborPerMeter))} บาท/เมตร`,
      "",
      `ค่าวัสดุประมาณ: ${formatTHB(Math.round(totals.material))} บาท`,
      `ค่าแรงประมาณ: ${formatTHB(Math.round(totals.labor))} บาท`,
      `รวมประมาณ: ${formatTHB(Math.round(totals.total))} บาท`,
      "",
      "รบกวนติดต่อกลับเพื่อยืนยันสเปค/หน้างาน/เส้นทางเดินสาย",
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `/?prefill=${encodeURIComponent(message)}#contact`;
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Navbar />

      <section className="pt-24 pb-10 bg-white border-b border-[#d0d7de]">
        <div className="container">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1f2328]">จัดสเปคกล้องวงจรปิด</h1>
            <p className="text-[#656d76] text-lg mt-3">
              เลือกยี่ห้อ → เลือกรุ่นกล้อง/เครื่องบันทึก/HDD → ใส่ระยะสายรวม แล้วคำนวณค่าวัสดุ+ค่าแรงติดตั้ง (บาท/เมตร)
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container space-y-8">
          <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
            <aside className="bg-white border border-[#d0d7de] rounded-2xl p-6 sticky top-24">
              <div className="text-[#1f2328] font-bold text-lg">สรุป</div>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#656d76]">ค่าวัสดุ</span>
                  <span className="text-[#1f2328] font-bold">{formatTHB(Math.round(totals.material))}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#656d76]">ค่าแรงติดตั้ง</span>
                  <span className="text-[#1f2328] font-bold">{formatTHB(Math.round(totals.labor))}</span>
                </div>
                <div className="h-px bg-[#d0d7de]" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#656d76]">รวม</span>
                  <span className="text-[#1f2328] font-bold text-lg">{formatTHB(Math.round(totals.total))}</span>
                </div>
              </div>

              <button type="button" onClick={handleContact} className="btn-blue w-full py-3 text-base mt-6">
                ส่งให้ทีมประเมิน
              </button>

              <div className="text-xs text-[#656d76] mt-3">
                ราคาวัสดุดึงจาก kstsystem.co.th และอาจเปลี่ยนแปลงได้ตามสต็อก/โปรโมชัน
              </div>
            </aside>

            <div className="space-y-6">
              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">1) ยี่ห้อ</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    [
                      { id: "hikvision", label: "Hikvision" },
                      { id: "dahua", label: "Dahua" },
                      { id: "uniview", label: "Uniview" },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBrand(b.id)}
                      className={[
                        "px-4 py-2 rounded-lg border text-sm transition-all",
                        brand === b.id
                          ? "bg-[#e7f0ff] border-[#0969da] text-[#0969da]"
                          : "bg-white border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f]",
                      ].join(" ")}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {(loading || error) && (
                  <div className="mt-4 text-sm">
                    {loading && <div className="text-[#656d76]">กำลังโหลดรายการสินค้า...</div>}
                    {error && <div className="text-red-600 break-words">{error}</div>}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">2) กล้อง</div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">จำนวนกล้อง (ตัว)</label>
                    <input
                      type="number"
                      min={1}
                      value={cameraCount}
                      onChange={(e) => setCameraCount(Number(e.target.value) || 1)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">โหมดกลางคืน</label>
                    <select
                      value={nightMode}
                      onChange={(e) => setNightMode(e.target.value as "ir" | "fullcolor")}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      <option value="ir">IR (ขาวดำกลางคืน)</option>
                      <option value="fullcolor">Full Color (ภาพสี)</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" checked={needMic} onChange={(e) => setNeedMic(e.target.checked)} />
                    ต้องการไมค์ (บันทึกเสียง)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" checked={needTalk} onChange={(e) => setNeedTalk(e.target.checked)} />
                    ต้องการโต้ตอบได้ (Two-way)
                  </label>
                </div>

                <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">ค้นหารุ่น</label>
                    <input
                      value={cameraQuery}
                      onChange={(e) => setCameraQuery(e.target.value)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    />
                  </div>
                  <div className="text-xs text-[#656d76] text-right">
                    {formatTHB(cameraFiltered.length)} รายการ
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {cameraFiltered.slice(0, 8).map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setSelectedCameraUrl(p.url)}
                      className={[
                        "text-left border rounded-xl p-4 transition-all",
                        selectedCameraUrl === p.url ? "border-[#0969da] ring-2 ring-[#0969da]/25" : "border-[#d0d7de] hover:border-[#8c959f]",
                      ].join(" ")}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#f6f8fa] border border-[#d0d7de] overflow-hidden shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[#1f2328] font-bold text-sm leading-snug line-clamp-2">
                            {p.name}
                          </div>
                          <div className="text-[#656d76] text-xs mt-1">
                            {p.price ? `${formatTHB(Math.round(p.price))} บาท/ตัว` : "ราคาไม่พร้อมใช้งาน"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!loading && !cameraFiltered.length && (
                    <div className="text-sm text-[#656d76]">ไม่พบรุ่นที่ตรงเงื่อนไข ลองปิดตัวเลือกไมค์/โต้ตอบ หรือเปลี่ยนโหมดกลางคืน</div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">3) เครื่องบันทึก (NVR)</div>
                <div className="mt-4 grid gap-3">
                  {nvrFiltered.slice(0, 8).map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setSelectedNvrUrl(p.url)}
                      className={[
                        "text-left border rounded-xl p-4 transition-all",
                        selectedNvrUrl === p.url ? "border-[#0969da] ring-2 ring-[#0969da]/25" : "border-[#d0d7de] hover:border-[#8c959f]",
                      ].join(" ")}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#f6f8fa] border border-[#d0d7de] overflow-hidden shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[#1f2328] font-bold text-sm leading-snug line-clamp-2">
                            {p.name}
                          </div>
                          <div className="text-[#656d76] text-xs mt-1">
                            {p.price ? `${formatTHB(Math.round(p.price))} บาท` : "ราคาไม่พร้อมใช้งาน"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!loading && !nvrFiltered.length && (
                    <div className="text-sm text-[#656d76]">ไม่พบรุ่นเครื่องบันทึกที่เหมาะกับจำนวนกล้อง</div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">4) HDD</div>
                <div className="mt-4 grid md:grid-cols-2 gap-4 items-end">
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">จำนวน HDD (ลูก)</label>
                    <input
                      type="number"
                      min={0}
                      value={hddQty}
                      onChange={(e) => setHddQty(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">เลือกรุ่น HDD</label>
                    <select
                      value={selectedHddUrl}
                      onChange={(e) => setSelectedHddUrl(e.target.value)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      {hddFiltered.map((p) => (
                        <option key={p.url} value={p.url}>
                          {p.name} — {p.price ? `${formatTHB(Math.round(p.price))} บาท` : "ราคาไม่พร้อมใช้งาน"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">5) งานติดตั้ง / ระยะสาย</div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">ระยะสายเฉลี่ย (เมตร/จุด)</label>
                    <input
                      type="number"
                      min={0}
                      value={cablePerCameraM}
                      onChange={(e) => setCablePerCameraM(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">เผื่อสาย (%)</label>
                    <input
                      type="number"
                      min={0}
                      value={cableExtraPercent}
                      onChange={(e) => setCableExtraPercent(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">เผื่อเพิ่ม (เมตร)</label>
                    <input
                      type="number"
                      min={0}
                      value={cableExtraMeters}
                      onChange={(e) => setCableExtraMeters(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">ค่าแรงติดตั้ง (บาท/เมตร)</label>
                    <input
                      type="number"
                      min={0}
                      value={laborPerMeter}
                      onChange={(e) => setLaborPerMeter(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                </div>

                <div className="mt-4 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                  <div className="text-xs text-[#656d76]">ระยะสายรวม (ประมาณ)</div>
                  <div className="text-[#1f2328] font-bold text-lg mt-1">
                    {formatTHB(Math.round(totals.cableWithExtra))} เมตร
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">6) รายการสรุป</div>
                <div className="mt-4 overflow-x-auto border border-[#d0d7de] rounded-xl">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-[#f6f8fa] text-[#1f2328]">
                      <tr>
                        <th className="text-left font-bold px-4 py-3 w-[56px]">#</th>
                        <th className="text-left font-bold px-4 py-3">รายการ</th>
                        <th className="text-right font-bold px-4 py-3 w-[160px]">ราคา/หน่วย (บาท)</th>
                        <th className="text-right font-bold px-4 py-3 w-[140px]">จำนวน</th>
                        <th className="text-right font-bold px-4 py-3 w-[160px]">รวม (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d0d7de]">
                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">1)</td>
                        <td className="px-4 py-4">
                          <div className="text-[#1f2328] font-semibold">{selectedCamera?.name ?? "-"}</div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">
                          {formatTHB(Math.round(selectedCamera?.price ?? 0))}
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(totals.cams)} ตัว</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                          {formatTHB(Math.round(totals.cameraSubtotal))}
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">2)</td>
                        <td className="px-4 py-4">
                          <div className="text-[#1f2328] font-semibold">{selectedNvr?.name ?? "-"}</div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">
                          {formatTHB(Math.round(selectedNvr?.price ?? 0))}
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">1 เครื่อง</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                          {formatTHB(Math.round(totals.nvrSubtotal))}
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">3)</td>
                        <td className="px-4 py-4">
                          <div className="text-[#1f2328] font-semibold">{selectedHdd?.name ?? "-"}</div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">
                          {formatTHB(Math.round(selectedHdd?.price ?? 0))}
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.max(0, Math.round(hddQty || 0)))} ลูก</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                          {formatTHB(Math.round(totals.hddSubtotal))}
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">4)</td>
                        <td className="px-4 py-4">
                          <div className="text-[#1f2328] font-semibold">ค่าแรงติดตั้ง (คิดตามระยะสาย)</div>
                          <div className="text-xs text-[#656d76] mt-1">
                            ระยะสายรวม {formatTHB(Math.round(totals.cableWithExtra))} เมตร • {formatTHB(Math.round(laborPerMeter))} บาท/เมตร
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(laborPerMeter))}</td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.cableWithExtra))} เมตร</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                          {formatTHB(Math.round(totals.labor))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

