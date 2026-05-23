import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { kstCctvSources, type KstBrand } from "@/data/kstCctvSources";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";

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

type DownloadStatus = "idle" | "generating" | "done" | "error";
type LeadStatus = "idle" | "saving" | "saved" | "error";

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
  const [confirmPoeOpen, setConfirmPoeOpen] = useState(false);
  const [pendingPoeUrl, setPendingPoeUrl] = useState<string>("");
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

  const [customerType, setCustomerType] = useState<"personal" | "company">("personal");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerFieldErrors, setCustomerFieldErrors] = useState<Record<string, string>>({});

  const [companyName, setCompanyName] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");
  const [companyBranch, setCompanyBranch] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPostcode, setCompanyPostcode] = useState("");
  const [companyContactName, setCompanyContactName] = useState("");
  const [companyContactPhone, setCompanyContactPhone] = useState("");
  const [companyLineId, setCompanyLineId] = useState("");
  const [siteSameAsCompany, setSiteSameAsCompany] = useState(false);
  const [siteAddress, setSiteAddress] = useState("");

  const customerSectionRef = useRef<HTMLDivElement | null>(null);
  const specPdfRef = useRef<HTMLDivElement | null>(null);
  const quotePdfRef = useRef<HTMLDivElement | null>(null);
  const [specDownloadStatus, setSpecDownloadStatus] = useState<DownloadStatus>("idle");
  const [quoteDownloadStatus, setQuoteDownloadStatus] = useState<DownloadStatus>("idle");
  const [specLeadStatus, setSpecLeadStatus] = useState<LeadStatus>("idle");
  const [quoteLeadStatus, setQuoteLeadStatus] = useState<LeadStatus>("idle");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nvrProducts, setNvrProducts] = useState<KstProduct[]>([]);
  const [cameraProducts, setCameraProducts] = useState<KstProduct[]>([]);
  const [poeSwitchProducts, setPoeSwitchProducts] = useState<KstProduct[]>([]);
  const [hddProducts, setHddProducts] = useState<KstProduct[]>([]);

  useEffect(() => {
    if (!siteSameAsCompany) return;
    const v = [companyAddress.trim(), companyPostcode.trim()].filter(Boolean).join(" ");
    setSiteAddress(v);
  }, [siteSameAsCompany, companyAddress, companyPostcode]);

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
  const pendingPoeSwitch = useMemo(
    () => poeSwitchProducts.find((p) => p.url === pendingPoeUrl) ?? null,
    [poeSwitchProducts, pendingPoeUrl]
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
      if (pendingPoeUrl) setPendingPoeUrl("");
      if (confirmPoeOpen) setConfirmPoeOpen(false);
      return;
    }
  }, [showPoeSwitchSection, selectedPoeSwitchUrl, confirmPoeOpen, pendingPoeUrl]);

  const totals = useMemo(() => {
    const cams = Math.max(0, Math.round(totalCameraQty || 0));
    const cameraSubtotal = selectedCameras.reduce((sum, l) => {
      const unit = l.product?.price ? l.product.price + 300 : 0;
      return sum + unit * l.qty;
    }, 0);
    const nvrUnitPrice = selectedNvr?.price ? selectedNvr.price + 1000 : 0;
    const poeSwitchUnitPrice =
      showPoeSwitchSection && selectedPoeSwitchUrl && selectedPoeSwitch?.price ? selectedPoeSwitch.price + 300 : 0;
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
  const poeRowNo = showPoeSwitchSection && selectedPoeSwitchUrl ? rowNo + 1 : null;
  if (poeRowNo) rowNo = poeRowNo;
  const hddRowNo = rowNo + 1;
  rowNo = hddRowNo;
  const laborRowNo = rowNo + 1;
  rowNo = laborRowNo;
  const supportRowNo = (totals.supportTotal || 0) > 0 ? rowNo + 1 : null;
  if (supportRowNo) rowNo = supportRowNo;
  const rackRowNo = (totals.rackTotal || 0) > 0 ? rowNo + 1 : null;

  const specRows = useMemo(() => {
    const rows: Array<{
      no: number;
      key: string;
      name: string;
      qty: number;
      unit: number | null;
      subtotal: number | null;
    }> = [];

    for (const l of selectedCameras) {
      const unit = l.product?.price ? l.product.price + 300 : null;
      const qty = Math.max(0, Math.round(l.qty || 0));
      rows.push({
        no: 0,
        key: l.url,
        name: l.product?.name ?? "-",
        qty,
        unit,
        subtotal: unit != null ? unit * qty : null,
      });
    }

    rows.push({
      no: 0,
      key: "nvr",
      name: selectedNvr?.name ?? "-",
      qty: 1,
      unit: totals.nvrUnitPrice || null,
      subtotal: totals.nvrSubtotal || null,
    });

    if (showPoeSwitchSection && selectedPoeSwitchUrl) {
      rows.push({
        no: 0,
        key: "poe",
        name: selectedPoeSwitch?.name ?? "-",
        qty: 1,
        unit: totals.poeSwitchUnitPrice || null,
        subtotal: totals.poeSwitchSubtotal || null,
      });
    }

    rows.push({
      no: 0,
      key: "hdd",
      name: selectedHdd?.name ?? "-",
      qty: Math.max(0, Math.round(hddQty || 0)),
      unit: totals.hddUnitPrice || null,
      subtotal: totals.hddSubtotal || null,
    });

    return rows.map((r, idx) => ({ ...r, no: idx + 1 }));
  }, [
    selectedCameras,
    selectedNvr?.name,
    selectedPoeSwitch?.name,
    selectedPoeSwitchUrl,
    selectedHdd?.name,
    hddQty,
    showPoeSwitchSection,
    totals.hddSubtotal,
    totals.hddUnitPrice,
    totals.nvrSubtotal,
    totals.nvrUnitPrice,
    totals.poeSwitchSubtotal,
    totals.poeSwitchUnitPrice,
  ]);

  const specRowPages = useMemo(() => {
    const perPage = 10;
    const pages: Array<typeof specRows> = [];
    for (let i = 0; i < specRows.length; i += perPage) pages.push(specRows.slice(i, i + perPage));
    return pages.length ? pages : [[]];
  }, [specRows]);

  const specPageCount = specRowPages.length + 1;
  const quotePageCount = specRowPages.length + 1;

  const validateCustomer = () => {
    setCustomerError(null);
    setCustomerFieldErrors({});

    if (customerType === "personal") {
      const errors: Record<string, string> = {};
      if (!customerName.trim()) errors.customerName = "กรุณากรอกชื่อลูกค้า";
      if (!customerPhone.trim()) errors.customerPhone = "กรุณากรอกเบอร์โทร";
      if (!customerAddress.trim()) errors.customerAddress = "กรุณากรอกที่อยู่";
      if (Object.keys(errors).length) {
        setCustomerError("กรุณากรอกข้อมูลลูกค้าให้ครบ");
        setCustomerFieldErrors(errors);
        customerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return false;
      }
      return true;
    }

    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = "กรุณากรอกชื่อบริษัท/นิติบุคคล";
    if (!companyTaxId.trim()) errors.companyTaxId = "กรุณากรอกเลขที่ผู้เสียภาษี";
    if (!companyBranch.trim()) errors.companyBranch = "กรุณากรอกสาขา";
    if (!companyAddress.trim()) errors.companyAddress = "กรุณากรอกที่อยู่ (บริษัท)";
    if (!companyPostcode.trim()) errors.companyPostcode = "กรุณากรอกรหัสไปรษณีย์";
    if (!companyContactName.trim()) errors.companyContactName = "กรุณากรอกผู้ติดต่อ";
    if (!companyContactPhone.trim()) errors.companyContactPhone = "กรุณากรอกเบอร์โทร";
    if (!companyLineId.trim()) errors.companyLineId = "กรุณากรอกไอดีไลน์";
    if (!siteAddress.trim()) errors.siteAddress = "กรุณากรอกที่อยู่ (หน้างาน)";
    if (Object.keys(errors).length) {
      setCustomerError("กรุณากรอกข้อมูลลูกค้าให้ครบ");
      setCustomerFieldErrors(errors);
      customerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    }
    return true;
  };

  const recordLead = async (source: "spec" | "quote") => {
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
    const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";
    if (!supabaseUrl || !supabaseAnonKey) return false;

    const payload = {
      source,
      customer_type: customerType,
      customer:
        customerType === "personal"
          ? {
              customer_name: customerName,
              customer_phone: customerPhone,
              customer_address: customerAddress,
            }
          : {
              company_name: companyName,
              company_tax_id: companyTaxId,
              company_branch: companyBranch,
              company_address: companyAddress,
              company_postcode: companyPostcode,
              contact_name: companyContactName,
              contact_phone: companyContactPhone,
              contact_line_id: companyLineId,
              site_address: siteAddress,
            },
      selection: {
        brand,
        nightMode,
        needMic,
        needTalk,
        rows: specRows,
      },
      totals: {
        material: Math.round(totals.material),
        labor: Math.round(totals.labor),
        total: Math.round(totals.total),
        vat: Math.round(totals.vat),
        totalWithVat: Math.round(totals.totalWithVat),
        cableWithExtra: Math.round(totals.cableWithExtra),
        laborRate: Math.round(totals.laborRate),
      },
      page_url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };

    const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/cctv_leads`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  };

  const downloadSpecPdf = async () => {
    if (!validateCustomer()) return;
    if (!specPdfRef.current) return;

    const fileName = `cctv-spec-${new Date().toISOString().slice(0, 10)}.pdf`;
    setSpecDownloadStatus("generating");
    setSpecLeadStatus("saving");
    const w = window.open("", "_blank");
    if (w) w.document.body.innerHTML = "<div style='font-family: Sarabun, Tahoma, Arial, sans-serif; padding:16px;'>กำลังสร้างไฟล์ PDF...</div>";

    try {
      const fontReady = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
      if (fontReady) await fontReady;

      const pages = Array.from(specPdfRef.current.querySelectorAll<HTMLElement>('[data-spec-page="true"]'));
      if (!pages.length) return;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < pages.length; i += 1) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        if (i < pages.length - 1) pdf.addPage();
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      if (w) w.location.href = url;
      else window.open(url, "_blank");
      window.setTimeout(() => URL.revokeObjectURL(url), 120000);
      setSpecDownloadStatus("done");
      const ok = await recordLead("spec");
      setSpecLeadStatus(ok ? "saved" : "error");
    } catch {
      if (w) w.close();
      setSpecDownloadStatus("error");
      setSpecLeadStatus("error");
    }
  };

  const downloadQuotePdf = async () => {
    if (!validateCustomer()) return;
    if (!quotePdfRef.current) return;

    const fileName = `cctv-quote-${new Date().toISOString().slice(0, 10)}.pdf`;
    setQuoteDownloadStatus("generating");
    setQuoteLeadStatus("saving");
    const w = window.open("", "_blank");
    if (w) w.document.body.innerHTML = "<div style='font-family: Sarabun, Tahoma, Arial, sans-serif; padding:16px;'>กำลังสร้างไฟล์ PDF...</div>";

    try {
      const fontReady = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
      if (fontReady) await fontReady;

      const pages = Array.from(quotePdfRef.current.querySelectorAll<HTMLElement>('[data-quote-page="true"]'));
      if (!pages.length) return;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < pages.length; i += 1) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        if (i < pages.length - 1) pdf.addPage();
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      if (w) w.location.href = url;
      else window.open(url, "_blank");
      window.setTimeout(() => URL.revokeObjectURL(url), 120000);
      setQuoteDownloadStatus("done");
      const ok = await recordLead("quote");
      setQuoteLeadStatus(ok ? "saved" : "error");
    } catch {
      if (w) w.close();
      setQuoteDownloadStatus("error");
      setQuoteLeadStatus("error");
    }
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
                            <div className="min-w-0 flex-1">
                              <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{l.product?.name ?? "-"}</div>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <div className="text-xs text-[#656d76]">จำนวน (ตัว)</div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateCameraQty(l.url, Math.max(0, (l.qty ?? 0) - 1))}
                                    className="w-7 h-7 rounded-md border border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f] transition-all"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min={0}
                                    value={l.qty}
                                    onChange={(e) => updateCameraQty(l.url, Number(e.target.value) || 0)}
                                    className="w-14 h-7 bg-white border border-[#d0d7de] rounded-md px-2 text-[#1f2328] text-xs text-right focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateCameraQty(l.url, (l.qty ?? 0) + 1)}
                                    className="w-7 h-7 rounded-md border border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f] transition-all"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeCamera(l.url)}
                                    className="w-7 h-7 rounded-md border border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f] transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
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
                      {selectedPoeSwitchUrl ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                            {selectedPoeSwitch?.imageUrl ? (
                              <img src={selectedPoeSwitch.imageUrl} alt={selectedPoeSwitch.name} className="w-full h-full object-contain bg-white" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{selectedPoeSwitch?.name ?? "-"}</div>
                            <div className="mt-1 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => setSelectedPoeSwitchUrl("")}
                                className="text-xs px-2 py-1 rounded-md border border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f] transition-all"
                              >
                                เอาออก
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#656d76]">ยังไม่เพิ่ม PoE Switch</div>
                      )}
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
                      <div className="min-w-0 flex-1">
                        <div className="text-[#1f2328] font-semibold text-xs leading-snug line-clamp-2">{selectedHdd?.name ?? "-"}</div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="text-xs text-[#656d76]">จำนวน (ลูก)</div>
                          <input
                            type="number"
                            min={0}
                            value={hddQty}
                            onChange={(e) => setHddQty(Number(e.target.value) || 0)}
                            className="w-16 h-7 bg-white border border-[#d0d7de] rounded-md px-2 text-[#1f2328] text-xs text-right focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={customerSectionRef} className="mt-5 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                <div className="text-[#1f2328] font-bold text-sm">ข้อมูลลูกค้า (จำเป็นสำหรับเอกสาร)</div>
                {customerError ? <div className="text-xs text-red-600 mt-2">{customerError}</div> : null}

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerType("personal")}
                    className={[
                      "px-3 py-2 rounded-lg border text-xs font-semibold transition-all",
                      customerType === "personal"
                        ? "bg-[#e7f0ff] border-[#0969da] text-[#0969da]"
                        : "bg-white border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f]",
                    ].join(" ")}
                  >
                    บุคคลธรรมดา
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType("company")}
                    className={[
                      "px-3 py-2 rounded-lg border text-xs font-semibold transition-all",
                      customerType === "company"
                        ? "bg-[#e7f0ff] border-[#0969da] text-[#0969da]"
                        : "bg-white border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f]",
                    ].join(" ")}
                  >
                    นิติบุคคล/บริษัท/องค์กร
                  </button>
                </div>

                {customerType === "personal" ? (
                  <div className="mt-3 grid gap-3 text-sm">
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ชื่อลูกค้า</label>
                      <input
                        data-field="customerName"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (customerFieldErrors.customerName) setCustomerFieldErrors((p) => ({ ...p, customerName: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.customerName
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.customerName ? <div className="text-xs text-red-600">{customerFieldErrors.customerName}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">เบอร์โทร</label>
                      <input
                        data-field="customerPhone"
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (customerFieldErrors.customerPhone) setCustomerFieldErrors((p) => ({ ...p, customerPhone: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.customerPhone
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.customerPhone ? <div className="text-xs text-red-600">{customerFieldErrors.customerPhone}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ที่อยู่</label>
                      <textarea
                        rows={2}
                        data-field="customerAddress"
                        value={customerAddress}
                        onChange={(e) => {
                          setCustomerAddress(e.target.value);
                          if (customerFieldErrors.customerAddress) setCustomerFieldErrors((p) => ({ ...p, customerAddress: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all resize-none",
                          customerFieldErrors.customerAddress
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.customerAddress ? <div className="text-xs text-red-600">{customerFieldErrors.customerAddress}</div> : null}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 text-sm">
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ชื่อบริษัท/นิติบุคคล</label>
                      <input
                        data-field="companyName"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (customerFieldErrors.companyName) setCustomerFieldErrors((p) => ({ ...p, companyName: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.companyName
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.companyName ? <div className="text-xs text-red-600">{customerFieldErrors.companyName}</div> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <label className="text-xs text-[#656d76]">เลขที่ผู้เสียภาษี</label>
                        <input
                          data-field="companyTaxId"
                          value={companyTaxId}
                          onChange={(e) => {
                            setCompanyTaxId(e.target.value);
                            if (customerFieldErrors.companyTaxId) setCustomerFieldErrors((p) => ({ ...p, companyTaxId: "" }));
                          }}
                          className={[
                            "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                            customerFieldErrors.companyTaxId
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                          ].join(" ")}
                        />
                        {customerFieldErrors.companyTaxId ? <div className="text-xs text-red-600">{customerFieldErrors.companyTaxId}</div> : null}
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-xs text-[#656d76]">สาขา</label>
                        <input
                          data-field="companyBranch"
                          value={companyBranch}
                          onChange={(e) => {
                            setCompanyBranch(e.target.value);
                            if (customerFieldErrors.companyBranch) setCustomerFieldErrors((p) => ({ ...p, companyBranch: "" }));
                          }}
                          className={[
                            "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                            customerFieldErrors.companyBranch
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                          ].join(" ")}
                        />
                        {customerFieldErrors.companyBranch ? <div className="text-xs text-red-600">{customerFieldErrors.companyBranch}</div> : null}
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ที่อยู่ (บริษัท)</label>
                      <textarea
                        rows={2}
                        data-field="companyAddress"
                        value={companyAddress}
                        onChange={(e) => {
                          setCompanyAddress(e.target.value);
                          if (customerFieldErrors.companyAddress) setCustomerFieldErrors((p) => ({ ...p, companyAddress: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all resize-none",
                          customerFieldErrors.companyAddress
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.companyAddress ? <div className="text-xs text-red-600">{customerFieldErrors.companyAddress}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">รหัสไปรษณีย์</label>
                      <input
                        data-field="companyPostcode"
                        value={companyPostcode}
                        onChange={(e) => {
                          setCompanyPostcode(e.target.value);
                          if (customerFieldErrors.companyPostcode) setCustomerFieldErrors((p) => ({ ...p, companyPostcode: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.companyPostcode
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.companyPostcode ? <div className="text-xs text-red-600">{customerFieldErrors.companyPostcode}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ผู้ติดต่อ (ลูกค้า)</label>
                      <input
                        data-field="companyContactName"
                        value={companyContactName}
                        onChange={(e) => {
                          setCompanyContactName(e.target.value);
                          if (customerFieldErrors.companyContactName) setCustomerFieldErrors((p) => ({ ...p, companyContactName: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.companyContactName
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.companyContactName ? <div className="text-xs text-red-600">{customerFieldErrors.companyContactName}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">เบอร์โทร</label>
                      <input
                        data-field="companyContactPhone"
                        value={companyContactPhone}
                        onChange={(e) => {
                          setCompanyContactPhone(e.target.value);
                          if (customerFieldErrors.companyContactPhone) setCustomerFieldErrors((p) => ({ ...p, companyContactPhone: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.companyContactPhone
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.companyContactPhone ? <div className="text-xs text-red-600">{customerFieldErrors.companyContactPhone}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ไอดีไลน์</label>
                      <input
                        data-field="companyLineId"
                        value={companyLineId}
                        onChange={(e) => {
                          setCompanyLineId(e.target.value);
                          if (customerFieldErrors.companyLineId) setCustomerFieldErrors((p) => ({ ...p, companyLineId: "" }));
                        }}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all",
                          customerFieldErrors.companyLineId
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.companyLineId ? <div className="text-xs text-red-600">{customerFieldErrors.companyLineId}</div> : null}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs text-[#656d76]">ที่อยู่ (หน้างาน)</label>
                      <label className="flex items-center gap-2 text-xs text-[#1f2328]">
                        <input
                          type="checkbox"
                          className="accent-[#0969da]"
                          checked={siteSameAsCompany}
                          onChange={(e) => {
                            setSiteSameAsCompany(e.target.checked);
                            if (customerFieldErrors.siteAddress) setCustomerFieldErrors((p) => ({ ...p, siteAddress: "" }));
                          }}
                        />
                        ที่อยู่หน้างานเหมือนที่อยู่บริษัท
                      </label>
                      <textarea
                        rows={2}
                        data-field="siteAddress"
                        value={siteAddress}
                        onChange={(e) => {
                          setSiteAddress(e.target.value);
                          if (customerFieldErrors.siteAddress) setCustomerFieldErrors((p) => ({ ...p, siteAddress: "" }));
                        }}
                        disabled={siteSameAsCompany}
                        className={[
                          "w-full bg-white border rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none transition-all resize-none disabled:opacity-60",
                          customerFieldErrors.siteAddress
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                        ].join(" ")}
                      />
                      {customerFieldErrors.siteAddress ? <div className="text-xs text-red-600">{customerFieldErrors.siteAddress}</div> : null}
                    </div>
                  </div>
                )}
              </div>

              <a
                href="https://line.me/ti/p/~0900072977"
                target="_blank"
                rel="noreferrer"
                className="btn-blue w-full py-3 text-base mt-6 text-center block"
              >
                ติดต่อ LINE
              </a>
              <button
                type="button"
                onClick={downloadSpecPdf}
                disabled={specDownloadStatus === "generating"}
                className="w-full py-3 text-base mt-2 rounded-xl border border-[#0969da] text-[#0969da] hover:bg-[#0969da]/5 transition-all font-semibold disabled:opacity-60"
              >
                {specDownloadStatus === "generating" ? "กำลังสร้างเอกสารสเปค..." : "ดาวน์โหลดเอกสารสเปค"}
              </button>
              <button
                type="button"
                onClick={downloadQuotePdf}
                disabled={quoteDownloadStatus === "generating"}
                className="w-full py-3 text-base mt-2 rounded-xl border border-[#1f2328] text-[#1f2328] hover:bg-[#1f2328]/5 transition-all font-semibold disabled:opacity-60"
              >
                {quoteDownloadStatus === "generating" ? "กำลังสร้างใบเสนอราคา..." : "ดาวน์โหลดใบเสนอราคา"}
              </button>
              {specDownloadStatus !== "idle" || quoteDownloadStatus !== "idle" ? (
                <div className="text-xs text-[#656d76] mt-2 grid gap-1">
                  {specDownloadStatus === "done" ? (
                    <div>เปิดไฟล์เอกสารสเปคแล้ว (ถ้าบล็อคป๊อปอัพ ให้เปิดไฟล์จากรายการดาวน์โหลด)</div>
                  ) : null}
                  {specDownloadStatus === "error" ? <div>สร้างไฟล์เอกสารสเปคไม่สำเร็จ</div> : null}
                  {specLeadStatus === "saving" ? <div>กำลังบันทึกข้อมูล...</div> : null}
                  {specLeadStatus === "saved" ? <div>บันทึกข้อมูลเรียบร้อย</div> : null}
                  {specLeadStatus === "error" ? <div>บันทึกข้อมูลไม่สำเร็จ</div> : null}
                  {quoteDownloadStatus === "done" ? (
                    <div>เปิดไฟล์ใบเสนอราคาแล้ว (ถ้าบล็อคป๊อปอัพ ให้เปิดไฟล์จากรายการดาวน์โหลด)</div>
                  ) : null}
                  {quoteDownloadStatus === "error" ? <div>สร้างไฟล์ใบเสนอราคาไม่สำเร็จ</div> : null}
                  {quoteLeadStatus === "saving" ? <div>กำลังบันทึกข้อมูล...</div> : null}
                  {quoteLeadStatus === "saved" ? <div>บันทึกข้อมูลเรียบร้อย</div> : null}
                  {quoteLeadStatus === "error" ? <div>บันทึกข้อมูลไม่สำเร็จ</div> : null}
                </div>
              ) : null}

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
                    ไม่ได้เพิ่มเข้าตะกร้าอัตโนมัติ หากต้องการให้กดเลือกรุ่น แล้วระบบจะถามยืนยันก่อนเพิ่มเข้าตะกร้า
                  </div>
                  <div className="mt-4 grid gap-3">
                    {poeSwitchFiltered.slice(0, 8).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => {
                          setPendingPoeUrl(p.url);
                          setConfirmPoeOpen(true);
                        }}
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

      <Dialog open={confirmPoeOpen} onOpenChange={setConfirmPoeOpen}>
        <DialogContent className="bg-white border border-[#d0d7de] rounded-2xl p-6 sm:p-8 max-w-lg">
          <DialogTitle className="text-[#1f2328] text-xl font-bold">ยืนยันเพิ่ม PoE Switch</DialogTitle>
          <DialogDescription className="text-[#656d76] text-sm mt-1">
            ต้องการเพิ่ม PoE Switch เข้าตะกร้าสินค้าหรือไม่
          </DialogDescription>

          <div className="mt-4 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                {pendingPoeSwitch?.imageUrl ? (
                  <img src={pendingPoeSwitch.imageUrl} alt={pendingPoeSwitch.name} className="w-full h-full object-contain bg-white" />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="text-[#1f2328] font-bold text-sm leading-snug line-clamp-2">{pendingPoeSwitch?.name ?? "-"}</div>
                <div className="text-xs text-[#656d76] mt-1">
                  {pendingPoeSwitch?.price ? `${formatTHB(Math.round(pendingPoeSwitch.price + 300))} บาท` : "ราคาไม่พร้อมใช้งาน"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmPoeOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-[#d0d7de] text-sm text-[#1f2328] hover:border-[#8c959f] transition-all"
            >
              ไม่เพิ่ม
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingPoeUrl) setSelectedPoeSwitchUrl(pendingPoeUrl);
                setConfirmPoeOpen(false);
              }}
              className="btn-blue px-5 py-2.5 text-sm"
            >
              เพิ่มเข้าตะกร้า
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed left-[-99999px] top-0">
        <div ref={specPdfRef} className="grid gap-4" style={{ fontFamily: "'Sarabun', Tahoma, Arial, sans-serif" }}>
          {specRowPages.map((rows, pageIdx) => (
            <div key={`spec-items-${pageIdx}`} data-spec-page="true" className="w-[794px] h-[1123px] bg-white box-border p-10 flex flex-col text-[#111827]">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img src="/siamai-logo.png" alt="SAT" className="h-10 w-auto" />
                  <div>
                    <div className="text-sm font-bold tracking-wide">ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์</div>
                    <div className="text-xs text-[#6b7280] mt-0.5">เอกสารสเปคกล้องวงจรปิด (เบื้องต้น)</div>
                    <div className="text-xs text-[#6b7280] mt-0.5">{new Date().toLocaleString("th-TH")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#6b7280]">รวมสุทธิ (รวม VAT 7%)</div>
                  <div className="text-lg font-bold">{formatTHB(Math.round(totals.totalWithVat))} บาท</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div className="border border-[#e5e7eb] rounded-lg p-4">
                  <div className="font-bold">ข้อมูลลูกค้า</div>
                  <div className="mt-2 grid gap-1 text-[#374151]">
                    {customerType === "personal" ? (
                      <>
                        <div>ประเภท: บุคคลธรรมดา</div>
                        <div>ชื่อลูกค้า: {customerName || "-"}</div>
                        <div>เบอร์โทร: {customerPhone || "-"}</div>
                        <div>ที่อยู่: {customerAddress || "-"}</div>
                      </>
                    ) : (
                      <>
                        <div>ประเภท: นิติบุคคล/บริษัท/องค์กร</div>
                        <div>ชื่อบริษัท/นิติบุคคล: {companyName || "-"}</div>
                        <div>
                          เลขที่ผู้เสียภาษี: {companyTaxId || "-"} • สาขา: {companyBranch || "-"}
                        </div>
                        <div>ที่อยู่ (บริษัท): {companyAddress || "-"} {companyPostcode ? ` ${companyPostcode}` : ""}</div>
                        <div>
                          ผู้ติดต่อ: {companyContactName || "-"} • โทร: {companyContactPhone || "-"} • ไลน์: {companyLineId || "-"}
                        </div>
                        <div>ที่อยู่ (หน้างาน): {siteAddress || "-"}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="border border-[#e5e7eb] rounded-lg p-4">
                  <div className="font-bold">สรุปสเปค</div>
                  <div className="mt-2 grid gap-1 text-[#374151]">
                    <div>ยี่ห้อ: {brand === "hikvision" ? "Hikvision" : brand === "dahua" ? "Dahua" : "Uniview"}</div>
                    <div>โหมดกลางคืน: {nightMode === "fullcolor" ? "Full Color" : "IR"}</div>
                    <div>ไมค์: {needMic ? "ต้องการ" : "ไม่จำเป็น"}</div>
                    <div>โต้ตอบ: {needTalk ? "ต้องการ" : "ไม่จำเป็น"}</div>
                    <div>จำนวนกล้องรวม: {formatTHB(totals.cams)} ตัว</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border border-[#e5e7eb] rounded-lg overflow-hidden flex-1">
                <div className="bg-[#f3f4f6] px-4 py-2 text-xs font-bold">รายการอุปกรณ์</div>
                <table className="w-full text-xs">
                  <thead className="bg-white">
                    <tr className="border-b border-[#e5e7eb]">
                      <th className="text-left font-bold px-4 py-2 w-[60px]">ลำดับ</th>
                      <th className="text-left font-bold px-4 py-2">รายการ</th>
                      <th className="text-right font-bold px-4 py-2 w-[80px]">จำนวน</th>
                      <th className="text-right font-bold px-4 py-2 w-[120px]">ราคา/หน่วย</th>
                      <th className="text-right font-bold px-4 py-2 w-[120px]">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {rows.length ? (
                      rows.map((r) => (
                        <tr key={r.key}>
                          <td className="px-4 py-2">{r.no}</td>
                          <td className="px-4 py-2">
                            <div className="leading-snug whitespace-normal break-words">{r.name}</div>
                          </td>
                          <td className="px-4 py-2 text-right">{formatTHB(r.qty)}</td>
                          <td className="px-4 py-2 text-right">{r.unit != null ? formatTHB(Math.round(r.unit)) : "-"}</td>
                          <td className="px-4 py-2 text-right">{r.subtotal != null ? formatTHB(Math.round(r.subtotal)) : "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-2 text-[#6b7280]" colSpan={5}>
                          -
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] text-[#6b7280]">
                <div>siamai.cloud • 098-592-6522</div>
                <div>หน้า {pageIdx + 1}/{specPageCount}</div>
              </div>
            </div>
          ))}

          <div data-spec-page="true" className="w-[794px] h-[1123px] bg-white box-border p-10 flex flex-col text-[#111827]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <img src="/siamai-logo.png" alt="SAT" className="h-10 w-auto" />
                <div>
                  <div className="text-sm font-bold tracking-wide">ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์</div>
                  <div className="text-xs text-[#6b7280] mt-0.5">สรุปและอนุมัติสเปค</div>
                  <div className="text-xs text-[#6b7280] mt-0.5">{new Date().toLocaleString("th-TH")}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#6b7280]">รวมสุทธิ (รวม VAT 7%)</div>
                <div className="text-lg font-bold">{formatTHB(Math.round(totals.totalWithVat))} บาท</div>
              </div>
            </div>

            <div className="mt-5 border border-[#e5e7eb] rounded-lg p-5">
              <div className="text-sm font-bold">สรุปราคา</div>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">ค่าวัสดุประมาณ</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.material))} บาท</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">ค่าแรงประมาณ</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.labor))} บาท</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">รวมก่อน VAT</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.total))} บาท</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">VAT 7%</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.vat))} บาท</div>
                </div>
                <div className="h-px bg-[#e5e7eb]" />
                <div className="flex items-center justify-between gap-6">
                  <div className="font-bold">รวมสุทธิ</div>
                  <div className="font-bold text-lg">{formatTHB(Math.round(totals.totalWithVat))} บาท</div>
                </div>
              </div>
            </div>

            <div className="mt-5 border border-[#e5e7eb] rounded-lg p-5 text-sm">
              <div className="font-bold">รายละเอียดงานติดตั้ง</div>
              <div className="mt-2 grid gap-1 text-[#374151]">
                <div>ระยะสายเฉลี่ย: {formatTHB(Math.max(0, cablePerCameraM || 0))} ม./จุด</div>
                <div>เผื่อสาย: {formatTHB(Math.max(0, cableExtraPercent || 0))}% + {formatTHB(Math.max(0, cableExtraMeters || 0))} ม.</div>
                <div>ระยะสายรวม: {formatTHB(Math.round(totals.cableWithExtra))} ม.</div>
                <div>ค่าแรงติดตั้ง: {formatTHB(Math.round(totals.laborRate))} บาท/เมตร</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
              <div className="border border-[#e5e7eb] rounded-lg p-5">
                <div className="font-bold">ผู้จัดทำ/เสนอราคา</div>
                <div className="mt-10 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">ลายเซ็น / ผู้จัดทำ</div>
                <div className="mt-6 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">วันที่</div>
              </div>
              <div className="border border-[#e5e7eb] rounded-lg p-5">
                <div className="font-bold">ผู้อนุมัติ/ลูกค้า</div>
                <div className="mt-10 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">ลายเซ็น / ผู้อนุมัติ</div>
                <div className="mt-6 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">วันที่</div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="mt-6 text-xs text-[#6b7280] leading-relaxed">
                ราคาอาจเปลี่ยนแปลงได้ตามสต็อก/โปรโมชัน และอาจมีรายการเพิ่มเติมตามการสำรวจหน้างานจริง (เอกสารฉบับนี้เป็นการประเมินเบื้องต้น)
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#6b7280]">
                <div>siamai.cloud • 098-592-6522</div>
                <div>หน้า {specPageCount}/{specPageCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div ref={quotePdfRef} className="grid gap-4" style={{ fontFamily: "'Sarabun', Tahoma, Arial, sans-serif" }}>
          {specRowPages.map((rows, pageIdx) => (
            <div key={`quote-items-${pageIdx}`} data-quote-page="true" className="w-[794px] h-[1123px] bg-white box-border p-10 flex flex-col text-[#111827]">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img src="/siamai-logo.png" alt="SAT" className="h-10 w-auto" />
                  <div>
                    <div className="text-sm font-bold tracking-wide">ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์</div>
                    <div className="text-xs text-[#6b7280] mt-0.5">ใบเสนอราคา (Quotation)</div>
                    <div className="text-xs text-[#6b7280] mt-0.5">{new Date().toLocaleString("th-TH")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#6b7280]">รวมสุทธิ (รวม VAT 7%)</div>
                  <div className="text-lg font-bold">{formatTHB(Math.round(totals.totalWithVat))} บาท</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div className="border border-[#e5e7eb] rounded-lg p-4">
                  <div className="font-bold">ข้อมูลลูกค้า</div>
                  <div className="mt-2 grid gap-1 text-[#374151]">
                    {customerType === "personal" ? (
                      <>
                        <div>ประเภท: บุคคลธรรมดา</div>
                        <div>ชื่อลูกค้า: {customerName || "-"}</div>
                        <div>เบอร์โทร: {customerPhone || "-"}</div>
                        <div>ที่อยู่: {customerAddress || "-"}</div>
                      </>
                    ) : (
                      <>
                        <div>ประเภท: นิติบุคคล/บริษัท/องค์กร</div>
                        <div>ชื่อบริษัท/นิติบุคคล: {companyName || "-"}</div>
                        <div>
                          เลขที่ผู้เสียภาษี: {companyTaxId || "-"} • สาขา: {companyBranch || "-"}
                        </div>
                        <div>ที่อยู่ (บริษัท): {companyAddress || "-"} {companyPostcode ? ` ${companyPostcode}` : ""}</div>
                        <div>
                          ผู้ติดต่อ: {companyContactName || "-"} • โทร: {companyContactPhone || "-"} • ไลน์: {companyLineId || "-"}
                        </div>
                        <div>ที่อยู่ (หน้างาน): {siteAddress || "-"}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="border border-[#e5e7eb] rounded-lg p-4">
                  <div className="font-bold">ขอบเขตงาน</div>
                  <div className="mt-2 grid gap-1 text-[#374151]">
                    <div>ยี่ห้อ: {brand === "hikvision" ? "Hikvision" : brand === "dahua" ? "Dahua" : "Uniview"}</div>
                    <div>โหมดกลางคืน: {nightMode === "fullcolor" ? "Full Color" : "IR"}</div>
                    <div>ไมค์: {needMic ? "ต้องการ" : "ไม่จำเป็น"}</div>
                    <div>โต้ตอบ: {needTalk ? "ต้องการ" : "ไม่จำเป็น"}</div>
                    <div>จำนวนกล้องรวม: {formatTHB(totals.cams)} ตัว</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border border-[#e5e7eb] rounded-lg overflow-hidden flex-1">
                <div className="bg-[#f3f4f6] px-4 py-2 text-xs font-bold">รายการสินค้า/อุปกรณ์</div>
                <table className="w-full text-xs">
                  <thead className="bg-white">
                    <tr className="border-b border-[#e5e7eb]">
                      <th className="text-left font-bold px-4 py-2 w-[60px]">ลำดับ</th>
                      <th className="text-left font-bold px-4 py-2">รายการ</th>
                      <th className="text-right font-bold px-4 py-2 w-[80px]">จำนวน</th>
                      <th className="text-right font-bold px-4 py-2 w-[120px]">ราคา/หน่วย</th>
                      <th className="text-right font-bold px-4 py-2 w-[120px]">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {rows.length ? (
                      rows.map((r) => (
                        <tr key={r.key}>
                          <td className="px-4 py-2">{r.no}</td>
                          <td className="px-4 py-2">
                            <div className="leading-snug whitespace-normal break-words">{r.name}</div>
                          </td>
                          <td className="px-4 py-2 text-right">{formatTHB(r.qty)}</td>
                          <td className="px-4 py-2 text-right">{r.unit != null ? formatTHB(Math.round(r.unit)) : "-"}</td>
                          <td className="px-4 py-2 text-right">{r.subtotal != null ? formatTHB(Math.round(r.subtotal)) : "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-2 text-[#6b7280]" colSpan={5}>
                          -
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] text-[#6b7280]">
                <div>siamai.cloud • 098-592-6522</div>
                <div>หน้า {pageIdx + 1}/{quotePageCount}</div>
              </div>
            </div>
          ))}

          <div data-quote-page="true" className="w-[794px] h-[1123px] bg-white box-border p-10 flex flex-col text-[#111827]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <img src="/siamai-logo.png" alt="SAT" className="h-10 w-auto" />
                <div>
                  <div className="text-sm font-bold tracking-wide">ห้างหุ้นส่วนจำกัด สยาม เอไอ ทูลส์</div>
                  <div className="text-xs text-[#6b7280] mt-0.5">สรุปราคาและอนุมัติใบเสนอราคา</div>
                  <div className="text-xs text-[#6b7280] mt-0.5">{new Date().toLocaleString("th-TH")}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#6b7280]">รวมสุทธิ (รวม VAT 7%)</div>
                <div className="text-lg font-bold">{formatTHB(Math.round(totals.totalWithVat))} บาท</div>
              </div>
            </div>

            <div className="mt-5 border border-[#e5e7eb] rounded-lg p-5">
              <div className="text-sm font-bold">สรุปราคา</div>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">ค่าวัสดุประมาณ</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.material))} บาท</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">ค่าแรงประมาณ</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.labor))} บาท</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">รวมก่อน VAT</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.total))} บาท</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-[#374151]">VAT 7%</div>
                  <div className="font-bold">{formatTHB(Math.round(totals.vat))} บาท</div>
                </div>
                <div className="h-px bg-[#e5e7eb]" />
                <div className="flex items-center justify-between gap-6">
                  <div className="font-bold">รวมสุทธิ</div>
                  <div className="font-bold text-lg">{formatTHB(Math.round(totals.totalWithVat))} บาท</div>
                </div>
              </div>
            </div>

            <div className="mt-5 border border-[#e5e7eb] rounded-lg p-5 text-sm">
              <div className="font-bold">เงื่อนไขเบื้องต้น</div>
              <div className="mt-2 grid gap-1 text-[#374151]">
                <div>1) ราคานี้เป็นการประเมินเบื้องต้น (อาจเปลี่ยนแปลงตามการสำรวจหน้างานจริง/สต็อก/โปรโมชัน)</div>
                <div>2) ระยะสายรวม: {formatTHB(Math.round(totals.cableWithExtra))} ม. • ค่าแรง {formatTHB(Math.round(totals.laborRate))} บาท/เมตร</div>
                <div>3) ราคาสุทธิรวม VAT 7% แล้ว</div>
                <div>4) เงื่อนไขการชำระเงิน: ชำระค่าสินค้า + ค่าแรงติดตั้ง 100%</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
              <div className="border border-[#e5e7eb] rounded-lg p-5">
                <div className="font-bold">ผู้จัดทำ/เสนอราคา</div>
                <div className="mt-10 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">ลายเซ็น / ผู้จัดทำ</div>
                <div className="mt-6 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">วันที่</div>
              </div>
              <div className="border border-[#e5e7eb] rounded-lg p-5">
                <div className="font-bold">ผู้อนุมัติ/ลูกค้า</div>
                <div className="mt-10 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">ลายเซ็น / ผู้อนุมัติ</div>
                <div className="mt-6 border-b border-[#111827]" />
                <div className="mt-2 text-xs text-[#6b7280]">วันที่</div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="mt-6 text-xs text-[#6b7280] leading-relaxed">
                siamai.cloud • 098-592-6522 • Line: 0900072977
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#6b7280]">
                <div>siamai.cloud • 098-592-6522</div>
                <div>หน้า {quotePageCount}/{quotePageCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
