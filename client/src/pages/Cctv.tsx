import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
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

type CameraLine = {
  url: string;
  qty: number;
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

function parsePorts(name: string) {
  const m = name.match(/\b(\d+)\s*(?:port|ports)\b/i);
  if (m) return Number(m[1]);
  const m2 = name.match(/(\d+)\s*พอร์ต/);
  if (m2) return Number(m2[1]);
  const m3 = name.match(/\b(\d+)\s*P\b/i);
  if (m3) return Number(m3[1]);
  return null;
}

function nvrHasBuiltInPoe(name: string) {
  if (/\bpoe\b/i.test(name)) return true;
  if (/\b(\d+)\s*P\b/i.test(name)) return true;
  return false;
}

function parseHddTb(name: string) {
  const m = name.match(/(\d+)\s*TB/i);
  if (!m) return null;
  return Number(m[1]);
}

export default function Cctv() {
  const [brand, setBrand] = useState<KstBrand>("hikvision");
  const showPoeSwitchSelection = brand !== "hikvision";
  const [nightMode, setNightMode] = useState<"ir" | "fullcolor">("ir");
  const [needMic, setNeedMic] = useState(true);
  const [needTalk, setNeedTalk] = useState(false);

  const [cameraQuery, setCameraQuery] = useState("");
  const [cameraLines, setCameraLines] = useState<CameraLine[]>([]);
  const [nvrChannel, setNvrChannel] = useState<"auto" | 4 | 8 | 16 | 32>("auto");
  const [nvrPoe, setNvrPoe] = useState<"any" | "poe" | "nonpoe">("any");
  const [selectedNvrUrl, setSelectedNvrUrl] = useState<string>("");
  const [selectedPoeSwitchUrl, setSelectedPoeSwitchUrl] = useState<string>("");
  const [selectedHddUrl, setSelectedHddUrl] = useState<string>("");
  const [hddQty, setHddQty] = useState<number>(1);

  const [cablePerCameraM, setCablePerCameraM] = useState<number>(20);
  const [cableExtraPercent, setCableExtraPercent] = useState<number>(10);
  const [cableExtraMeters, setCableExtraMeters] = useState<number>(0);
  const [laborLevel, setLaborLevel] = useState<"normal" | "difficult">("normal");
  const [laborNeedClearance, setLaborNeedClearance] = useState(false);
  const [laborNeedEmt, setLaborNeedEmt] = useState(false);
  const [supportUnitCost, setSupportUnitCost] = useState<number>(0);
  const [supportQty, setSupportQty] = useState<number>(0);
  const [rackCost, setRackCost] = useState<number>(0);

  const [estimateOpen, setEstimateOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerMapUrl, setCustomerMapUrl] = useState("");
  const [customerDriveUrl, setCustomerDriveUrl] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nvrProducts, setNvrProducts] = useState<KstProduct[]>([]);
  const [cameraProducts, setCameraProducts] = useState<KstProduct[]>([]);
  const [poeSwitchProducts, setPoeSwitchProducts] = useState<KstProduct[]>([]);
  const [hddProducts, setHddProducts] = useState<KstProduct[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setNvrProducts([]);
        setCameraProducts([]);
        setPoeSwitchProducts([]);
        setHddProducts([]);
        setCameraLines([]);
        setNvrChannel("auto");
        setNvrPoe("any");
        setSelectedNvrUrl("");
        setSelectedPoeSwitchUrl("");
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
        const poeSwitchRes = await Promise.all(sources.poeSwitches.map((u) => fetchCategory(u)));
        const hddRes = await Promise.all(sources.hdd.map((u) => fetchCategory(u)));

        setNvrProducts(nvrRes.products);
        setCameraProducts(cameraRes.flatMap((r) => r.products));
        setPoeSwitchProducts(poeSwitchRes.flatMap((r) => r.products));
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

  const selectedCameras = useMemo(() => {
    return cameraLines
      .map((l) => ({
        ...l,
        qty: Math.max(0, Math.round(l.qty || 0)),
        product: cameraProducts.find((p) => p.url === l.url) ?? null,
      }))
      .filter((l) => l.qty > 0 && Boolean(l.product));
  }, [cameraLines, cameraProducts]);

  const totalCameraQty = useMemo(() => {
    return selectedCameras.reduce((sum, l) => sum + l.qty, 0);
  }, [selectedCameras]);

  const addCamera = (url: string) => {
    setCameraLines((prev) => {
      const next = prev.slice();
      const idx = next.findIndex((l) => l.url === url);
      if (idx >= 0) {
        next[idx] = { ...next[idx], qty: (next[idx]?.qty ?? 0) + 1 };
        return next;
      }
      return [...next, { url, qty: 1 }];
    });
  };

  const updateCameraQty = (url: string, qty: number) => {
    setCameraLines((prev) =>
      prev
        .map((l) => (l.url === url ? { ...l, qty } : l))
        .filter((l) => Math.max(0, Math.round(l.qty || 0)) > 0)
    );
  };

  const removeCamera = (url: string) => {
    setCameraLines((prev) => prev.filter((l) => l.url !== url));
  };

  const nvrFiltered = useMemo(() => {
    const needed = Math.max(1, Math.round(totalCameraQty || 0));
    const requiredChannels = nvrChannel === "auto" ? needed : nvrChannel;
    return nvrProducts
      .filter((p) => (p.price ?? 0) > 0)
      .map((p) => ({ ...p, channels: parseChannels(p.name), hasPoe: nvrHasBuiltInPoe(p.name) }))
      .filter((p) => {
        if (nvrChannel === "auto") return p.channels ? p.channels >= requiredChannels : true;
        return p.channels ? p.channels === requiredChannels : true;
      })
      .filter((p) => {
        if (nvrPoe === "any") return true;
        return nvrPoe === "poe" ? p.hasPoe : !p.hasPoe;
      })
      .slice()
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }, [nvrProducts, totalCameraQty, nvrChannel, nvrPoe]);

  const poeSwitchFiltered = useMemo(() => {
    if (!showPoeSwitchSelection) return [];
    const needed = Math.max(1, Math.round(totalCameraQty || 0));
    return poeSwitchProducts
      .filter((p) => (p.price ?? 0) > 0)
      .filter((p) => /\bpoe\b/i.test(p.name))
      .map((p) => ({ ...p, ports: parsePorts(p.name) }))
      .filter((p) => (p.ports ? p.ports >= needed : true))
      .slice()
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }, [poeSwitchProducts, totalCameraQty, showPoeSwitchSelection]);

  const hddFiltered = useMemo(() => {
    return hddProducts
      .filter((p) => (p.price ?? 0) > 0)
      .map((p) => ({ ...p, tb: parseHddTb(p.name) }))
      .filter((p) => Boolean(p.tb))
      .slice()
      .sort((a, b) => (a.tb ?? 0) - (b.tb ?? 0));
  }, [hddProducts]);

  useEffect(() => {
    if (!cameraLines.length && cameraFiltered.length) setCameraLines([{ url: cameraFiltered[0].url, qty: 4 }]);
  }, [cameraLines.length, cameraFiltered]);

  useEffect(() => {
    if (!selectedNvrUrl && nvrFiltered.length) setSelectedNvrUrl(nvrFiltered[0].url);
  }, [selectedNvrUrl, nvrFiltered]);

  const selectedPoeSwitch = useMemo(
    () => poeSwitchProducts.find((p) => p.url === selectedPoeSwitchUrl) ?? null,
    [poeSwitchProducts, selectedPoeSwitchUrl]
  );

  useEffect(() => {
    if (!selectedHddUrl && hddFiltered.length) setSelectedHddUrl(hddFiltered[0].url);
  }, [selectedHddUrl, hddFiltered]);

  const selectedNvr = useMemo(
    () => nvrProducts.find((p) => p.url === selectedNvrUrl) ?? null,
    [nvrProducts, selectedNvrUrl]
  );
  const selectedHdd = useMemo(
    () => hddProducts.find((p) => p.url === selectedHddUrl) ?? null,
    [hddProducts, selectedHddUrl]
  );

  const needsPoeSwitch = useMemo(() => {
    if (!selectedNvr) return false;
    return !nvrHasBuiltInPoe(selectedNvr.name);
  }, [selectedNvr]);

  const showPoeSwitchSection = needsPoeSwitch && showPoeSwitchSelection;

  useEffect(() => {
    if (!showPoeSwitchSection) {
      if (selectedPoeSwitchUrl) setSelectedPoeSwitchUrl("");
      return;
    }
    if (!selectedPoeSwitchUrl && poeSwitchFiltered.length) setSelectedPoeSwitchUrl(poeSwitchFiltered[0].url);
  }, [showPoeSwitchSection, selectedPoeSwitchUrl, poeSwitchFiltered]);

  const totals = useMemo(() => {
    const cams = Math.max(0, Math.round(totalCameraQty || 0));
    const cameraSubtotal = selectedCameras.reduce((sum, l) => {
      const unit = l.product?.price ? l.product.price + 300 : 0;
      return sum + unit * l.qty;
    }, 0);
    const nvrUnitPrice = selectedNvr?.price ? selectedNvr.price + 1000 : 0;
    const poeSwitchUnitPrice = showPoeSwitchSection && selectedPoeSwitch?.price ? selectedPoeSwitch.price + 300 : 0;
    const hddUnitPrice = selectedHdd?.price ? selectedHdd.price + 300 : 0;

    const nvrSubtotal = nvrUnitPrice;
    const poeSwitchSubtotal = poeSwitchUnitPrice;
    const hddSubtotal = hddUnitPrice * Math.max(0, Math.round(hddQty || 0));

    const baseCable = cams * Math.max(0, cablePerCameraM || 0);
    const cableWithExtra = baseCable * (1 + Math.max(0, cableExtraPercent || 0) / 100) + Math.max(0, cableExtraMeters || 0);
    const laborBasePerMeter = laborLevel === "normal" ? 100 : 200;
    const laborClearPerMeter = laborNeedClearance ? 20 : 0;
    const laborEmtPerMeter = laborNeedEmt ? 200 : 0;
    const laborRate = laborBasePerMeter + laborClearPerMeter + laborEmtPerMeter;
    const laborByMeter = cableWithExtra * laborRate;
    const supportTotal = Math.max(0, supportUnitCost || 0) * Math.max(0, Math.round(supportQty || 0));
    const rackTotal = Math.max(0, rackCost || 0);
    const labor = laborByMeter + supportTotal + rackTotal;

    const material = cameraSubtotal + nvrSubtotal + poeSwitchSubtotal + hddSubtotal;
    const total = material + labor;
    const vat = total * 0.07;
    const totalWithVat = total + vat;

    return {
      cams,
      baseCable,
      cableWithExtra,
      nvrUnitPrice,
      poeSwitchUnitPrice,
      hddUnitPrice,
      cameraSubtotal,
      nvrSubtotal,
      poeSwitchSubtotal,
      hddSubtotal,
      laborBasePerMeter,
      laborClearPerMeter,
      laborEmtPerMeter,
      laborRate,
      laborByMeter,
      supportUnitCost,
      supportQty,
      supportTotal,
      rackTotal,
      labor,
      material,
      total,
      vat,
      totalWithVat,
    };
  }, [
    totalCameraQty,
    selectedCameras,
    selectedNvr?.price,
    selectedPoeSwitch?.price,
    showPoeSwitchSection,
    selectedHdd?.price,
    hddQty,
    cablePerCameraM,
    cableExtraPercent,
    cableExtraMeters,
    laborLevel,
    laborNeedClearance,
    laborNeedEmt,
    supportUnitCost,
    supportQty,
    rackCost,
  ]);

  const cameraRowsForSummary = useMemo((): Array<{ url: string; qty: number; product: KstProduct | null }> => {
    if (selectedCameras.length) return selectedCameras;
    return [{ url: "__empty__", qty: 0, product: null }];
  }, [selectedCameras]);

  let rowNo = cameraRowsForSummary.length;
  const nvrRowNo = rowNo + 1;
  rowNo = nvrRowNo;
  const poeRowNo = showPoeSwitchSection ? rowNo + 1 : null;
  if (poeRowNo) rowNo = poeRowNo;
  const hddRowNo = rowNo + 1;
  rowNo = hddRowNo;
  const laborRowNo = rowNo + 1;
  rowNo = laborRowNo;
  const supportRowNo = (totals.supportTotal || 0) > 0 ? rowNo + 1 : null;
  if (supportRowNo) rowNo = supportRowNo;
  const rackRowNo = (totals.rackTotal || 0) > 0 ? rowNo + 1 : null;

  const handleContact = () => {
    const brandLabel =
      brand === "hikvision" ? "Hikvision" : brand === "dahua" ? "Dahua" : "Uniview";
    const cameraLinesText = selectedCameras.length
      ? ["กล้อง:", ...selectedCameras.map((l) => `- ${l.product?.name ?? "-"} x ${formatTHB(l.qty)} ตัว`)].join("\n")
      : "กล้อง: -";
    const message = [
      "ขอจัดสเปค/ประเมินกล้องวงจรปิด",
      "",
      customerName ? `ชื่อลูกค้า: ${customerName}` : null,
      customerPhone ? `เบอร์โทร: ${customerPhone}` : null,
      customerAddress ? `ที่อยู่: ${customerAddress}` : null,
      customerMapUrl ? `ลิงก์แผนที่: ${customerMapUrl}` : null,
      customerDriveUrl ? `ลิงก์รูป/ไฟล์ (Google Drive): ${customerDriveUrl}` : null,
      customerNote ? `หมายเหตุ: ${customerNote}` : null,
      "",
      `ยี่ห้อ: ${brandLabel}`,
      `จำนวนกล้อง: ${formatTHB(totals.cams)} ตัว`,
      `โหมดกลางคืน: ${nightMode === "fullcolor" ? "Full Color" : "IR"}`,
      `ไมค์: ${needMic ? "ต้องการ" : "ไม่จำเป็น"}`,
      `โต้ตอบ: ${needTalk ? "ต้องการ" : "ไม่จำเป็น"}`,
      "",
      cameraLinesText,
      `เครื่องบันทึก: ${selectedNvr?.name ?? "-"}`,
      needsPoeSwitch
        ? showPoeSwitchSelection
          ? `PoE Switch: ${selectedPoeSwitch?.name ?? "-"}`
          : "PoE Switch: ต้องซื้อเพิ่ม (รุ่น NVR ไม่มี PoE)"
        : null,
      `HDD: ${selectedHdd?.name ?? "-"} x ${formatTHB(Math.max(0, Math.round(hddQty || 0)))} ลูก`,
      "",
      `ระยะสายเฉลี่ย: ${formatTHB(Math.max(0, cablePerCameraM || 0))} ม./จุด`,
      `เผื่อสาย: ${formatTHB(Math.max(0, cableExtraPercent || 0))}% + ${formatTHB(Math.max(0, cableExtraMeters || 0))} ม.`,
      `ระยะสายรวม: ${formatTHB(Math.round(totals.cableWithExtra))} ม.`,
      `ค่าแรงติดตั้ง: ${formatTHB(Math.round(totals.laborRate))} บาท/เมตร (พื้นฐาน ${formatTHB(Math.round(totals.laborBasePerMeter))} + เคลียร์ ${formatTHB(Math.round(totals.laborClearPerMeter))} + EMT ${formatTHB(Math.round(totals.laborEmtPerMeter))})`,
      (totals.supportTotal || 0) > 0
        ? `เสา Support: ${formatTHB(Math.round(totals.supportUnitCost || 0))} x ${formatTHB(Math.max(0, Math.round(totals.supportQty || 0)))} = ${formatTHB(Math.round(totals.supportTotal || 0))} บาท`
        : null,
      (totals.rackTotal || 0) > 0 ? `ตู้ Rack: ${formatTHB(Math.round(totals.rackTotal || 0))} บาท` : null,
      "",
      `ค่าวัสดุประมาณ: ${formatTHB(Math.round(totals.material))} บาท`,
      `ค่าแรงประมาณ: ${formatTHB(Math.round(totals.labor))} บาท`,
      `รวมก่อน VAT: ${formatTHB(Math.round(totals.total))} บาท`,
      `VAT 7%: ${formatTHB(Math.round(totals.vat))} บาท`,
      `รวมสุทธิ: ${formatTHB(Math.round(totals.totalWithVat))} บาท`,
      "",
      "วิธีการสั่งซื้อ",
      "1) เลือกรายการสินค้าและสเปค",
      "2) กด ส่งให้ทีมประเมิน รอการติดต่อกลับ",
      "3) เตรียมข้อมูล: รูปตำแหน่งติดตั้งกล้อง/เครื่องบันทึก/เราท์เตอร์, รูปพื้นที่บ้านโดยรวม, แบบแปลน (ถ้ามี), ที่อยู่",
      "",
      "รบกวนติดต่อกลับเพื่อยืนยันสเปค/หน้างาน/เส้นทางเดินสาย",
    ]
      .filter(Boolean)
      .join("\n");

    setEstimateOpen(false);
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
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#656d76]">VAT 7%</span>
                  <span className="text-[#1f2328] font-bold">{formatTHB(Math.round(totals.vat))}</span>
                </div>
                <div className="h-px bg-[#d0d7de]" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#656d76]">รวมสุทธิ</span>
                  <span className="text-[#1f2328] font-bold text-lg">{formatTHB(Math.round(totals.totalWithVat))}</span>
                </div>
              </div>

              <div className="mt-5 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                <div className="text-[#1f2328] font-bold text-sm">สินค้า/สเปคที่เลือก</div>
                <div className="mt-3 grid gap-3 text-sm">
                  <div className="grid gap-2">
                    <div className="text-xs text-[#656d76]">กล้อง</div>
                    {selectedCameras.length ? (
                      <div className="grid gap-2">
                        {selectedCameras.slice(0, 3).map((l) => (
                          <div key={l.url} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                              {l.product?.imageUrl ? (
                                <img src={l.product.imageUrl} alt={l.product.name} className="w-full h-full object-contain bg-white" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{l.product?.name ?? "-"}</div>
                              <div className="text-xs text-[#656d76] mt-0.5">x {formatTHB(l.qty)} ตัว</div>
                            </div>
                          </div>
                        ))}
                        {selectedCameras.length > 3 ? (
                          <div className="text-xs text-[#656d76]">และอีก {formatTHB(selectedCameras.length - 3)} รุ่น</div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-xs text-[#656d76]">ยังไม่ได้เลือกรุ่น</div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="text-xs text-[#656d76]">เครื่องบันทึก (NVR)</div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                        {selectedNvr?.imageUrl ? (
                          <img src={selectedNvr.imageUrl} alt={selectedNvr.name} className="w-full h-full object-contain bg-white" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{selectedNvr?.name ?? "-"}</div>
                      </div>
                    </div>
                  </div>

                  {showPoeSwitchSection ? (
                    <div className="grid gap-2">
                      <div className="text-xs text-[#656d76]">PoE Switch</div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                          {selectedPoeSwitch?.imageUrl ? (
                            <img src={selectedPoeSwitch.imageUrl} alt={selectedPoeSwitch.name} className="w-full h-full object-contain bg-white" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{selectedPoeSwitch?.name ?? "-"}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <div className="text-xs text-[#656d76]">HDD</div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                        {selectedHdd?.imageUrl ? (
                          <img src={selectedHdd.imageUrl} alt={selectedHdd.name} className="w-full h-full object-contain bg-white" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{selectedHdd?.name ?? "-"}</div>
                        <div className="text-xs text-[#656d76] mt-0.5">x {formatTHB(Math.max(0, Math.round(hddQty || 0)))} ลูก</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setEstimateOpen(true)} className="btn-blue w-full py-3 text-base mt-6">
                ส่งให้ทีมประเมิน
              </button>

              <div className="text-xs text-[#656d76] mt-3">
                ราคาอาจเปลี่ยนแปลงได้ตามสต็อก/โปรโมชัน
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
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">จำนวนกล้องรวม (ตัว)</label>
                    <div className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm text-right font-bold">
                      {formatTHB(Math.max(0, Math.round(totalCameraQty || 0)))}
                    </div>
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

                <div className="mt-5 border border-[#d0d7de] rounded-xl overflow-hidden">
                  <div className="bg-[#f6f8fa] px-4 py-3 text-sm font-bold text-[#1f2328]">รายการกล้องที่เลือก (กำหนดจำนวนต่อรุ่น)</div>
                  <div className="p-4">
                    {selectedCameras.length ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-[720px] w-full text-sm">
                          <thead className="text-[#1f2328]">
                            <tr className="border-b border-[#d0d7de]">
                              <th className="text-left font-bold pb-3">รุ่น</th>
                              <th className="text-right font-bold pb-3 w-[140px]">จำนวน (ตัว)</th>
                              <th className="text-right font-bold pb-3 w-[120px]">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#d0d7de]">
                            {selectedCameras.map((l) => (
                              <tr key={l.url} className="align-top">
                                <td className="py-3 pr-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                      {l.product?.imageUrl ? (
                                        <img src={l.product.imageUrl} alt={l.product.name} className="w-full h-full object-contain bg-white" />
                                      ) : null}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[#1f2328] font-semibold">{l.product?.name ?? "-"}</div>
                                      <div className="text-xs text-[#656d76] mt-0.5">ราคา/ตัว {l.product?.price ? formatTHB(Math.round(l.product.price + 300)) : "-"}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    min={0}
                                    value={l.qty}
                                    onChange={(e) => updateCameraQty(l.url, Number(e.target.value) || 0)}
                                    className="w-full bg-white border border-[#d0d7de] rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                                  />
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeCamera(l.url)}
                                    className="px-3 py-2 rounded-md border border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f] transition-all"
                                  >
                                    ลบ
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-[#656d76]">ยังไม่ได้เลือกรุ่นกล้อง</div>
                    )}
                  </div>
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
                      onClick={() => addCamera(p.url)}
                      className="text-left border border-[#d0d7de] hover:border-[#8c959f] rounded-xl p-4 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-xl bg-white border-[6px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain bg-white" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[#1f2328] font-bold text-sm leading-snug line-clamp-2">
                            {p.name}
                          </div>
                          <div className="text-[#656d76] text-xs mt-1">
                            {p.price ? `${formatTHB(Math.round(p.price + 300))} บาท/ตัว` : "ราคาไม่พร้อมใช้งาน"}
                          </div>
                          <div className="text-xs mt-2 text-[#0969da] font-semibold">กดเพื่อเพิ่มรุ่นนี้</div>
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
                <div className="text-xs text-[#656d76] mt-2">
                  กรุณาตรวจรุ่นที่เลือก หากไม่มี POE จะต้องซื้อ Switch Hub POE เพิ่ม
                  {needsPoeSwitch ? <span className="text-[#b35900] font-semibold"> (รุ่นที่เลือกไม่มี POE)</span> : null}
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">จำนวนช่อง</label>
                    <select
                      value={nvrChannel}
                      onChange={(e) => setNvrChannel((e.target.value === "auto" ? "auto" : Number(e.target.value)) as "auto" | 4 | 8 | 16 | 32)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      <option value="auto">อัตโนมัติ (ตามจำนวนกล้อง)</option>
                      <option value="4">4 CH</option>
                      <option value="8">8 CH</option>
                      <option value="16">16 CH</option>
                      <option value="32">32 CH</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">PoE</label>
                    <select
                      value={nvrPoe}
                      onChange={(e) => setNvrPoe(e.target.value as "any" | "poe" | "nonpoe")}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      <option value="any">ทั้งหมด</option>
                      <option value="poe">เฉพาะรุ่นมี PoE</option>
                      <option value="nonpoe">เฉพาะรุ่นไม่มี PoE</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {nvrFiltered.slice(0, 12).map((p) => (
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
                        <div className="w-24 h-24 rounded-xl bg-white border-[6px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain bg-white" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[#1f2328] font-bold text-sm leading-snug line-clamp-2">
                            {p.name}
                          </div>
                          <div className="text-[#656d76] text-xs mt-1">
                            {p.price ? `${formatTHB(Math.round(p.price + 1000))} บาท` : "ราคาไม่พร้อมใช้งาน"}
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

              {showPoeSwitchSection ? (
                <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                  <div className="text-[#1f2328] font-bold">4) PoE Switch (สำหรับ NVR ที่ไม่ PoE)</div>
                  <div className="text-xs text-[#656d76] mt-2">
                    ระบบจะเพิ่ม PoE Switch เพื่อจ่ายไฟให้กล้องตามจำนวนที่เลือก
                  </div>
                  <div className="mt-4 grid gap-3">
                    {poeSwitchFiltered.slice(0, 8).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setSelectedPoeSwitchUrl(p.url)}
                        className={[
                          "text-left border rounded-xl p-4 transition-all",
                          selectedPoeSwitchUrl === p.url ? "border-[#0969da] ring-2 ring-[#0969da]/25" : "border-[#d0d7de] hover:border-[#8c959f]",
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
                              {p.price ? `${formatTHB(Math.round(p.price + 300))} บาท` : "ราคาไม่พร้อมใช้งาน"}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {!loading && !poeSwitchFiltered.length && (
                      <div className="text-sm text-[#656d76]">ไม่พบ PoE Switch ที่ตรงเงื่อนไข</div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">{showPoeSwitchSection ? "5) HDD" : "4) HDD"}</div>
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
                          {p.name} — {p.price ? `${formatTHB(Math.round(p.price + 300))} บาท` : "ราคาไม่พร้อมใช้งาน"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">{showPoeSwitchSection ? "6) งานติดตั้ง / ระยะสาย" : "5) งานติดตั้ง / ระยะสาย"}</div>
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
                    <label className="text-xs text-[#656d76]">รูปแบบงานติดตั้ง</label>
                    <select
                      value={laborLevel}
                      onChange={(e) => setLaborLevel(e.target.value as "normal" | "difficult")}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      <option value="normal">พื้นที่ปกติ/โล่ง • สูงไม่เกิน 4ม • ใช้บันได • 100 บาท/เมตร (รวมสาย/ท่อ)</option>
                      <option value="difficult">งานยาก/สูง/ตั้งนั่งร้าน/พื้นที่อันตราย/เปิดฝ้า • 200 บาท/เมตร</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328] md:col-span-2">
                    <input
                      type="checkbox"
                      className="accent-[#0969da]"
                      checked={laborNeedClearance}
                      onChange={(e) => setLaborNeedClearance(e.target.checked)}
                    />
                    มีสิ่งกีดขวาง/ต้องเคลียร์พื้นที่ (+20 บาท/เมตร)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328] md:col-span-2">
                    <input
                      type="checkbox"
                      className="accent-[#0969da]"
                      checked={laborNeedEmt}
                      onChange={(e) => setLaborNeedEmt(e.target.checked)}
                    />
                    เดินท่อ EMT (+200 บาท/เมตร)
                  </label>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">เสา Support (ราคา/ต้น)</label>
                    <select
                      value={supportUnitCost}
                      onChange={(e) => setSupportUnitCost(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      <option value={0}>ไม่ใช้</option>
                      <option value={800}>Support 80cm — 800</option>
                      <option value={1500}>Support 1.20m — 1,500</option>
                      <option value={2500}>Support 1.5m — 2,500</option>
                      <option value={3500}>Support 3.0m — 3,500</option>
                      <option value={9500}>ตั้งเสาตอหม้อ 4m — 9,500</option>
                      <option value={15000}>ตั้งเสาตอหม้อ 6m — 15,000</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">จำนวนเสา (ต้น)</label>
                    <input
                      type="number"
                      min={0}
                      value={supportQty}
                      onChange={(e) => setSupportQty(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-[#656d76]">ตู้ Rack 6U</label>
                    <select
                      value={rackCost}
                      onChange={(e) => setRackCost(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      <option value={0}>ไม่ใช้</option>
                      <option value={2500}>มาตรฐานทั่วไป (ไม่รวมปลั๊ก/พัดลม) — 2,500</option>
                      <option value={6500}>เกรด Network 6U (Link/Germany) — 6,500</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#656d76]">ระยะสายรวม (ประมาณ)</span>
                      <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.cableWithExtra))} เมตร</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#656d76]">อัตราค่าแรง/เมตร</span>
                      <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.laborRate))} บาท</span>
                    </div>
                    {(totals.supportTotal || 0) > 0 ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#656d76]">เสา Support</span>
                        <span className="text-[#1f2328] font-semibold">
                          {formatTHB(Math.round(totals.supportUnitCost || 0))} x {formatTHB(Math.max(0, Math.round(totals.supportQty || 0)))} ={" "}
                          {formatTHB(Math.round(totals.supportTotal || 0))} บาท
                        </span>
                      </div>
                    ) : null}
                    {(totals.rackTotal || 0) > 0 ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#656d76]">ตู้ Rack</span>
                        <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.rackTotal || 0))} บาท</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="text-[#1f2328] font-bold">{showPoeSwitchSection ? "7) รายการสรุป" : "6) รายการสรุป"}</div>
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
                      {cameraRowsForSummary.map((l, idx) => {
                        const unit = l.product?.price ? l.product.price + 300 : 0;
                        const total = unit * l.qty;
                        return (
                          <tr key={`${l.url}-${idx}`} className="align-top">
                            <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${idx + 1})`}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                  {l.product?.imageUrl ? (
                                    <img src={l.product.imageUrl} alt={l.product.name} className="w-full h-full object-contain bg-white" />
                                  ) : null}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[#1f2328] font-semibold">{l.product?.name ?? "ยังไม่ได้เลือกรุ่นกล้อง"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(unit))}</td>
                            <td className="px-4 py-4 text-right text-[#1f2328]">{l.qty ? `${formatTHB(l.qty)} ตัว` : "-"}</td>
                            <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(total))}</td>
                          </tr>
                        );
                      })}

                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${nvrRowNo})`}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                              {selectedNvr?.imageUrl ? (
                                <img src={selectedNvr.imageUrl} alt={selectedNvr.name} className="w-full h-full object-contain bg-white" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[#1f2328] font-semibold">{selectedNvr?.name ?? "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.nvrUnitPrice))}</td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">1 เครื่อง</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.nvrSubtotal))}</td>
                      </tr>

                      {showPoeSwitchSection && poeRowNo ? (
                        <tr className="align-top">
                          <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${poeRowNo})`}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                {selectedPoeSwitch?.imageUrl ? (
                                  <img src={selectedPoeSwitch.imageUrl} alt={selectedPoeSwitch.name} className="w-full h-full object-contain bg-white" />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[#1f2328] font-semibold">{selectedPoeSwitch?.name ?? "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.poeSwitchUnitPrice))}</td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">1 เครื่อง</td>
                          <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.poeSwitchSubtotal))}</td>
                        </tr>
                      ) : null}

                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${hddRowNo})`}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                              {selectedHdd?.imageUrl ? (
                                <img src={selectedHdd.imageUrl} alt={selectedHdd.name} className="w-full h-full object-contain bg-white" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[#1f2328] font-semibold">{selectedHdd?.name ?? "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.hddUnitPrice))}</td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.max(0, Math.round(hddQty || 0)))} ลูก</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.hddSubtotal))}</td>
                      </tr>

                      <tr className="align-top">
                        <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${laborRowNo})`}</td>
                        <td className="px-4 py-4">
                          <div className="text-[#1f2328] font-semibold">ค่าแรงติดตั้ง (คิดตามระยะสาย)</div>
                          <div className="text-xs text-[#656d76] mt-1">
                            ระยะสายรวม {formatTHB(Math.round(totals.cableWithExtra))} เมตร • {formatTHB(Math.round(totals.laborRate))} บาท/เมตร
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.laborRate))}</td>
                        <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.cableWithExtra))} เมตร</td>
                        <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.laborByMeter))}</td>
                      </tr>

                      {(totals.supportTotal || 0) > 0 && supportRowNo ? (
                        <tr className="align-top">
                          <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${supportRowNo})`}</td>
                          <td className="px-4 py-4">
                            <div className="text-[#1f2328] font-semibold">เสา Support</div>
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.supportUnitCost || 0))}</td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.max(0, Math.round(totals.supportQty || 0)))} ต้น</td>
                          <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.supportTotal || 0))}</td>
                        </tr>
                      ) : null}

                      {(totals.rackTotal || 0) > 0 && rackRowNo ? (
                        <tr className="align-top">
                          <td className="px-4 py-4 text-[#1f2328] font-semibold">{`${rackRowNo})`}</td>
                          <td className="px-4 py-4">
                            <div className="text-[#1f2328] font-semibold">ตู้ Rack 6U</div>
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">{formatTHB(Math.round(totals.rackTotal || 0))}</td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">1 ตู้</td>
                          <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.rackTotal || 0))}</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-full max-w-sm border border-[#d0d7de] rounded-xl bg-[#f6f8fa] p-4 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#656d76]">ค่าวัสดุ</span>
                        <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.material))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#656d76]">ค่าแรงติดตั้ง</span>
                        <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.labor))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#656d76]">รวมก่อน VAT</span>
                        <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.total))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#656d76]">VAT 7%</span>
                        <span className="text-[#1f2328] font-semibold">{formatTHB(Math.round(totals.vat))}</span>
                      </div>
                      <div className="h-px bg-[#d0d7de]" />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#1f2328] font-bold">รวมสุทธิ</span>
                        <span className="text-[#1f2328] font-bold text-lg">{formatTHB(Math.round(totals.totalWithVat))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={estimateOpen} onOpenChange={setEstimateOpen}>
        <DialogContent className="bg-white border border-[#d0d7de] rounded-2xl p-6 sm:p-8 max-w-2xl">
          <DialogTitle className="text-[#1f2328] text-xl font-bold">ส่งให้ทีมประเมิน</DialogTitle>
          <DialogDescription className="text-[#656d76] text-sm mt-1">
            กรอกข้อมูลหน้างานเพื่อให้ทีมงานติดต่อกลับและยืนยันสเปค
          </DialogDescription>

          <div className="mt-4 border border-[#d0d7de] rounded-xl bg-[#f6f8fa] p-4 text-sm">
            <div className="text-[#1f2328] font-bold">วิธีการสั่งซื้อ</div>
            <div className="text-[#656d76] mt-2 leading-relaxed">
              1) เลือกรายการสินค้าและสเปค • 2) กด ส่งให้ทีมประเมิน รอการติดต่อกลับ • 3) เตรียมรูปหน้างาน/ตำแหน่งติดตั้ง/แบบแปลน (ถ้ามี) และแนบลิงก์ Google Drive
            </div>
          </div>

          <form
            className="mt-4 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleContact();
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs text-[#656d76]">ชื่อลูกค้า</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-[#656d76]">เบอร์โทร</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-[#656d76]">ที่อยู่</label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all resize-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-[#656d76]">ลิงก์ Google Maps (วางลิงก์แชร์)</label>
              <input
                value={customerMapUrl}
                onChange={(e) => setCustomerMapUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-[#656d76]">ลิงก์รูป/ไฟล์ (Google Drive)</label>
              <textarea
                rows={2}
                value={customerDriveUrl}
                onChange={(e) => setCustomerDriveUrl(e.target.value)}
                placeholder="วางลิงก์ Google Drive ที่แชร์แล้ว"
                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all resize-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-[#656d76]">หมายเหตุเพิ่มเติม</label>
              <textarea
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all resize-none"
              />
            </div>

            <DialogFooter className="mt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setEstimateOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-[#d0d7de] text-sm text-[#1f2328] hover:border-[#8c959f] transition-all"
              >
                ปิด
              </button>
              <button type="submit" className="btn-blue px-5 py-2.5 text-sm">
                ส่งข้อมูลให้ทีมประเมิน
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
