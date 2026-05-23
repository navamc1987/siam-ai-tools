import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  estimateV2Config,
  getLaborPerUnit,
  materialPresets,
  type BuildingType,
  type WorkDifficulty,
  type WorkType,
} from "@/data/estimateV2";
import { onestockCalculatorCards, type OnestockCalculatorId } from "@/data/onestockCalculators";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";

function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const size = Math.max(1, Math.floor(chunkSize));
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result.length ? result : [[]];
}

export default function Estimate() {
  const buildingTypes: BuildingType[] = [
    "บ้านเดี่ยว/ทาวน์โฮม",
    "อาคารพาณิชย์",
    "อพาร์ตเมนท์/หอพัก",
    "โรงงาน/คลังสินค้า",
  ];
  const workDifficulties: WorkDifficulty[] = ["สะดวก", "ปกติ", "ยาก", "ยากมาก"];

  const [calculator, setCalculator] = useState<OnestockCalculatorId>("construction");
  const [buildingType, setBuildingType] = useState<BuildingType>("บ้านเดี่ยว/ทาวน์โฮม");
  const [workDifficulty, setWorkDifficulty] = useState<WorkDifficulty>("ปกติ");

  const [areaSqm, setAreaSqm] = useState<number>(100);
  const [constructionType, setConstructionType] = useState<string>("proline");
  const [selections, setSelections] = useState<Record<string, string>>({});

  const [paintMode, setPaintMode] = useState<"interior" | "exterior">("interior");
  const [paintCoats, setPaintCoats] = useState<number>(2);
  const [paintCoverageSqmPerLiter, setPaintCoverageSqmPerLiter] = useState<number>(10);
  const [paintWasteRate, setPaintWasteRate] = useState<number>(10);

  const [concreteElement, setConcreteElement] = useState<"slab" | "footing" | "column" | "beam">("slab");
  const [concreteStrength, setConcreteStrength] = useState<"180" | "210" | "240" | "280">("210");
  const [concreteWasteRate, setConcreteWasteRate] = useState<number>(5);

  const [slabLengthM, setSlabLengthM] = useState<number>(10);
  const [slabWidthM, setSlabWidthM] = useState<number>(10);
  const [slabThicknessCm, setSlabThicknessCm] = useState<number>(10);

  const [footingLengthM, setFootingLengthM] = useState<number>(1);
  const [footingWidthM, setFootingWidthM] = useState<number>(1);
  const [footingHeightM, setFootingHeightM] = useState<number>(0.5);
  const [footingCount, setFootingCount] = useState<number>(1);

  const [columnWidthCm, setColumnWidthCm] = useState<number>(20);
  const [columnDepthCm, setColumnDepthCm] = useState<number>(20);
  const [columnHeightM, setColumnHeightM] = useState<number>(3);
  const [columnCount, setColumnCount] = useState<number>(1);

  const [beamWidthCm, setBeamWidthCm] = useState<number>(20);
  const [beamDepthCm, setBeamDepthCm] = useState<number>(30);
  const [beamLengthM, setBeamLengthM] = useState<number>(4);
  const [beamCount, setBeamCount] = useState<number>(1);

  const [brickWallLengthM, setBrickWallLengthM] = useState<number>(10);
  const [brickWallHeightM, setBrickWallHeightM] = useState<number>(3);
  const [brickOpeningsSqm, setBrickOpeningsSqm] = useState<number>(0);
  const [brickWasteRate, setBrickWasteRate] = useState<number>(5);

  const [metalRoofStyle, setMetalRoofStyle] = useState<"single" | "gable">("gable");
  const [metalLengthM, setMetalLengthM] = useState<number>(10);
  const [metalWidthM, setMetalWidthM] = useState<number>(6);
  const [metalPitchDeg, setMetalPitchDeg] = useState<number>(15);
  const [metalOverhangM, setMetalOverhangM] = useState<number>(0.3);
  const [metalWasteRate, setMetalWasteRate] = useState<number>(5);
  const [metalThickness, setMetalThickness] = useState<"035" | "040" | "047" | "050">("047");

  const [includeDemolition, setIncludeDemolition] = useState(false);
  const [demolitionAreaSqm, setDemolitionAreaSqm] = useState<number>(0);
  const [includeWaste, setIncludeWaste] = useState(false);
  const [wasteAreaSqm, setWasteAreaSqm] = useState<number>(0);

  const [customerType, setCustomerType] = useState<"personal" | "company">("personal");
  const [personalName, setPersonalName] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [personalAddress, setPersonalAddress] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");
  const [companyBranch, setCompanyBranch] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPostcode, setCompanyPostcode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactLineId, setContactLineId] = useState("");
  const [siteSameAsCompany, setSiteSameAsCompany] = useState(false);
  const [siteAddress, setSiteAddress] = useState("");

  const [customerFieldErrors, setCustomerFieldErrors] = useState<Record<string, string>>({});
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<{
    spec: "idle" | "generating" | "done" | "error";
    quote: "idle" | "generating" | "done" | "error";
  }>({ spec: "idle", quote: "idle" });

  const customerBlockRef = useRef<HTMLDivElement | null>(null);
  const specPdfRef = useRef<HTMLDivElement | null>(null);
  const quotePdfRef = useRef<HTMLDivElement | null>(null);

  type ConstructionRow = {
    key: string;
    amountPer100Sqm: number;
    skuOptions: string[];
    skuOptionDetails?: { sku: string; name: string | null }[];
    selectedSku: string;
    name: string | null;
    imageUrl: string | null;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
    url: string | null;
  };

  type ConstructionResponse = {
    input: { type: string; area: number; selections: Record<string, string> };
    types: string[];
    rows: ConstructionRow[];
    totals: { materialSubtotal: number };
  };

  const [constructionData, setConstructionData] = useState<ConstructionResponse | null>(null);
  const [constructionLoading, setConstructionLoading] = useState(false);
  const [constructionError, setConstructionError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteSameAsCompany) return;
    const addr = [companyAddress.trim(), companyPostcode.trim() ? `รหัสไปรษณีย์ ${companyPostcode.trim()}` : ""].filter(Boolean).join(" • ");
    setSiteAddress(addr);
  }, [siteSameAsCompany, companyAddress, companyPostcode]);

  const constructionTypeLabel: Record<string, string> = {
    proline: "ฉาบเรียบ-โปรลายน์",
    "proline-plus": "ฉาบเรียบ-โปรลายน์ พลัส",
    "t-bar-60x60": "ที-บาร์ 60x60",
    "t-bar-60x120": "ที-บาร์ 60x120",
    "gypsum-wall": "ผนังยิปซัม",
    "wall-lining-glue": "ผนังวอลล์ไลน์นิ่งติดกาว",
    "wall-lining-c-line": "ผนังวอลล์ไลน์นิ่งซีไลน์",
  };

  const constructionLaborWorkType: Record<string, WorkType> = {
    proline: "ceiling",
    "proline-plus": "ceiling",
    "t-bar-60x60": "ceiling",
    "t-bar-60x120": "ceiling",
    "gypsum-wall": "wall",
    "wall-lining-glue": "wall",
    "wall-lining-c-line": "wall",
  };

  const paint = useMemo(() => {
    if (calculator !== "paint") return null;

    const area = Math.max(0, areaSqm || 0);
    const coats = Math.max(1, Math.round(paintCoats || 0));
    const coverage = Math.max(1, paintCoverageSqmPerLiter || 0);
    const wasteRate = Math.max(0, paintWasteRate || 0) / 100;

    const liters = (area * coats) / coverage;
    const litersWithWaste = liters * (1 + wasteRate);

    const sizes = [18, 9, 3.785, 1];
    let remaining = litersWithWaste;
    const plan = sizes
      .map((size) => {
        const count = Math.floor((remaining + 1e-9) / size);
        remaining -= count * size;
        return { size, count };
      })
      .filter((x) => x.count > 0);

    if (remaining > 0.01) {
      const fillSize = sizes
        .slice()
        .sort((a, b) => a - b)
        .find((s) => s >= remaining) ?? 1;
      const idx = plan.findIndex((p) => p.size === fillSize);
      if (idx >= 0) {
        plan[idx] = { ...plan[idx], count: plan[idx].count + 1 };
      } else {
        plan.push({ size: fillSize, count: 1 });
      }
    }

    const totalProvided = plan.reduce((sum, p) => sum + p.size * p.count, 0);
    const excess = Math.max(0, totalProvided - litersWithWaste);

    const modeLabel = paintMode === "interior" ? "สีทาภายใน" : "สีทาภายนอก";
    const presetId = paintMode === "interior" ? "paint-interior-basic" : "paint-exterior-basic";
    const preset = materialPresets.find((p) => p.id === presetId) ?? null;

    return {
      area,
      coats,
      coverage,
      wasteRate,
      liters,
      litersWithWaste,
      plan,
      totalProvided,
      excess,
      modeLabel,
      preset,
    };
  }, [calculator, areaSqm, paintCoats, paintCoverageSqmPerLiter, paintWasteRate, paintMode]);

  const concrete = useMemo(() => {
    if (calculator !== "concrete") return null;

    const wasteRate = Math.max(0, concreteWasteRate || 0) / 100;
    const countClamp = (value: number) => Math.max(0, Math.round(value || 0));

    let volume = 0;
    let label = "";

    if (concreteElement === "slab") {
      const length = Math.max(0, slabLengthM || 0);
      const width = Math.max(0, slabWidthM || 0);
      const thicknessM = Math.max(0, slabThicknessCm || 0) / 100;
      volume = length * width * thicknessM;
      label = `พื้น/สแลบ ${length}×${width}×${slabThicknessCm}ซม.`;
    } else if (concreteElement === "footing") {
      const length = Math.max(0, footingLengthM || 0);
      const width = Math.max(0, footingWidthM || 0);
      const height = Math.max(0, footingHeightM || 0);
      const count = countClamp(footingCount);
      volume = length * width * height * count;
      label = `ฐานราก/ตอม่อ ${length}×${width}×${height}ม. ×${count}`;
    } else if (concreteElement === "column") {
      const widthM = Math.max(0, columnWidthCm || 0) / 100;
      const depthM = Math.max(0, columnDepthCm || 0) / 100;
      const height = Math.max(0, columnHeightM || 0);
      const count = countClamp(columnCount);
      volume = widthM * depthM * height * count;
      label = `เสา ${columnWidthCm}×${columnDepthCm}ซม. สูง ${height}ม. ×${count}`;
    } else if (concreteElement === "beam") {
      const widthM = Math.max(0, beamWidthCm || 0) / 100;
      const depthM = Math.max(0, beamDepthCm || 0) / 100;
      const length = Math.max(0, beamLengthM || 0);
      const count = countClamp(beamCount);
      volume = widthM * depthM * length * count;
      label = `คาน ${beamWidthCm}×${beamDepthCm}ซม. ยาว ${length}ม. ×${count}`;
    }

    const volumeWithWaste = volume * (1 + wasteRate);
    const presetId = `concrete-ready-mix-${concreteStrength}` as const;
    const preset = materialPresets.find((p) => p.id === presetId) ?? null;

    return {
      element: concreteElement,
      strength: concreteStrength,
      label,
      wasteRate,
      volume,
      volumeWithWaste,
      preset,
    };
  }, [
    calculator,
    concreteElement,
    concreteStrength,
    concreteWasteRate,
    slabLengthM,
    slabWidthM,
    slabThicknessCm,
    footingLengthM,
    footingWidthM,
    footingHeightM,
    footingCount,
    columnWidthCm,
    columnDepthCm,
    columnHeightM,
    columnCount,
    beamWidthCm,
    beamDepthCm,
    beamLengthM,
    beamCount,
  ]);

  const brick = useMemo(() => {
    if (calculator !== "brick") return null;

    const length = Math.max(0, brickWallLengthM || 0);
    const height = Math.max(0, brickWallHeightM || 0);
    const openings = Math.max(0, brickOpeningsSqm || 0);
    const wasteRate = Math.max(0, brickWasteRate || 0) / 100;

    const area = Math.max(0, length * height - openings);
    const areaWithWaste = area * (1 + wasteRate);
    const piecesPerSqm = 8.33;
    const pieces = areaWithWaste * piecesPerSqm;

    const preset = materialPresets.find((p) => p.id === "wall-qcon-brick-10cm") ?? null;
    return {
      length,
      height,
      openings,
      wasteRate,
      area,
      areaWithWaste,
      piecesPerSqm,
      pieces,
      preset,
    };
  }, [calculator, brickWallLengthM, brickWallHeightM, brickOpeningsSqm, brickWasteRate]);

  const metal = useMemo(() => {
    if (calculator !== "metal-sheet") return null;

    const length = Math.max(0, metalLengthM || 0);
    const width = Math.max(0, metalWidthM || 0);
    const overhang = Math.max(0, metalOverhangM || 0);
    const pitchDeg = Math.min(85, Math.max(0, metalPitchDeg || 0));
    const pitchRad = (pitchDeg * Math.PI) / 180;
    const slopeFactor = 1 / Math.max(0.1, Math.cos(pitchRad));
    const wasteRate = Math.max(0, metalWasteRate || 0) / 100;

    const eaveLength = length + 2 * overhang;
    const span = (width + 2 * overhang) * (metalRoofStyle === "gable" ? 0.5 : 1);
    const slopeLength = span * slopeFactor;
    const sides = metalRoofStyle === "gable" ? 2 : 1;

    const area = eaveLength * slopeLength * sides;
    const areaWithWaste = area * (1 + wasteRate);

    const coverWidth = 0.76;
    const sheetsPerSide = Math.ceil(eaveLength / coverWidth);
    const totalSheets = sheetsPerSide * sides;
    const totalSheetsWithWaste = Math.ceil(totalSheets * (1 + wasteRate));
    const totalLinearM = totalSheetsWithWaste * slopeLength;

    const presetId = `roof-metal-sheet-${metalThickness}-aluzinc`;
    const preset = materialPresets.find((p) => p.id === presetId) ?? null;

    return {
      roofStyle: metalRoofStyle,
      thickness: metalThickness,
      length,
      width,
      overhang,
      pitchDeg,
      slopeFactor,
      eaveLength,
      slopeLength,
      sides,
      wasteRate,
      area,
      areaWithWaste,
      coverWidth,
      sheetsPerSide,
      totalSheets,
      totalSheetsWithWaste,
      totalLinearM,
      preset,
    };
  }, [calculator, metalRoofStyle, metalThickness, metalLengthM, metalWidthM, metalOverhangM, metalPitchDeg, metalWasteRate]);

  useEffect(() => {
    if (calculator !== "construction") return;

    const controller = new AbortController();
    const run = async () => {
      try {
        setConstructionLoading(true);
        setConstructionError(null);

        const params = new URLSearchParams();
        params.set("area", String(Math.max(0, areaSqm || 0)));
        params.set("type", constructionType);
        Object.entries(selections).forEach(([k, v]) => {
          if (k && v) params.append("sel", `${k}:${v}`);
        });

        const res = await fetch(`/api/onestock-construction?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as ConstructionResponse;
        setConstructionData(data);
        if (data.types.length && !data.types.includes(constructionType)) {
          setConstructionType(data.types[0]);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setConstructionError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
        setConstructionData(null);
      } finally {
        setConstructionLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [calculator, areaSqm, constructionType, selections]);

  const totals = useMemo(() => {
    const safeArea = Math.max(0, areaSqm || 0);
    const concreteQty = calculator === "concrete" ? Math.max(0, concrete?.volumeWithWaste ?? 0) : 0;
    const brickQty = calculator === "brick" ? Math.max(0, brick?.areaWithWaste ?? 0) : 0;
    const metalQty = calculator === "metal-sheet" ? Math.max(0, metal?.areaWithWaste ?? 0) : 0;

    const laborQty =
      calculator === "concrete"
        ? concreteQty
        : calculator === "brick"
          ? brickQty
          : calculator === "metal-sheet"
            ? metalQty
            : safeArea;

    const materialSubtotal =
      calculator === "construction"
        ? constructionData?.totals.materialSubtotal ?? 0
        : calculator === "paint"
          ? (paint?.preset?.unitPriceExVat ?? 0) * safeArea
          : calculator === "concrete"
            ? (concrete?.preset?.unitPriceExVat ?? 0) * concreteQty
        : calculator === "brick"
          ? (brick?.preset?.unitPriceExVat ?? 0) * brickQty
        : calculator === "metal-sheet"
          ? (metal?.preset?.unitPriceExVat ?? 0) * metalQty
          : 0;

    const workType: WorkType =
      calculator === "construction"
        ? constructionLaborWorkType[constructionType] ?? "ceiling"
        : calculator === "paint"
          ? "paint"
          : calculator === "concrete"
            ? "concrete"
      : calculator === "brick"
        ? "wall"
      : calculator === "metal-sheet"
        ? "roof"
          : "ceiling";
    const laborPerSqm = getLaborPerUnit(workType, workDifficulty);
    const laborSubtotal = laborQty * laborPerSqm;

    const demolitionSubtotal =
      (includeDemolition ? Math.max(0, demolitionAreaSqm || 0) : 0) *
      getLaborPerUnit("demolition", workDifficulty);
    const wasteSubtotal =
      (includeWaste ? Math.max(0, wasteAreaSqm || 0) : 0) *
      getLaborPerUnit("waste", workDifficulty);

    const base = materialSubtotal + laborSubtotal + demolitionSubtotal + wasteSubtotal;
    const buildingMultiplier = estimateV2Config.buildingTypeMultiplier[buildingType];
    const afterBuilding = base * buildingMultiplier;
    const overhead = afterBuilding * estimateV2Config.overheadRate;
    const totalExVat = afterBuilding + overhead;
    const min = Math.round(totalExVat * (1 - estimateV2Config.bufferRate));
    const max = Math.round(totalExVat * (1 + estimateV2Config.bufferRate));

    return {
      materialSubtotal,
      laborSubtotal,
      demolitionSubtotal,
      wasteSubtotal,
      buildingMultiplier,
      overhead,
      totalExVat,
      min,
      max,
      laborPerSqm,
      laborQty,
      laborUnitLabel: calculator === "concrete" ? "คิว" : "ตร.ม.",
      laborWorkType: workType,
    };
  }, [
    calculator,
    constructionData,
    constructionType,
    workDifficulty,
    buildingType,
    areaSqm,
    paint?.preset?.unitPriceExVat,
    concrete?.preset?.unitPriceExVat,
    concrete?.volumeWithWaste,
    brick?.preset?.unitPriceExVat,
    brick?.areaWithWaste,
    metal?.preset?.unitPriceExVat,
    metal?.areaWithWaste,
    includeDemolition,
    demolitionAreaSqm,
    includeWaste,
    wasteAreaSqm,
  ]);

  const activeCard = onestockCalculatorCards.find((c) => c.id === calculator) ?? onestockCalculatorCards[0];

  type EstimateMaterialItem = {
    name: string;
    qty: number;
    unit: string;
    imageUrl: string | null;
    unitPriceExVat: number;
    totalExVat: number;
  };

  const vatRate = 0.07;
  const vatAmount = Math.round(totals.totalExVat * vatRate);
  const totalWithVat = Math.round(totals.totalExVat + vatAmount);
  const minWithVat = Math.round(totals.min + totals.min * vatRate);
  const maxWithVat = Math.round(totals.max + totals.max * vatRate);

  const materialItems = useMemo<EstimateMaterialItem[]>(() => {
    if (calculator === "construction") {
      return (constructionData?.rows ?? []).map((row) => ({
        name: row.name ?? row.key,
        qty: row.qty,
        unit: row.unit,
        imageUrl: row.imageUrl,
        unitPriceExVat: row.unitPrice,
        totalExVat: row.total,
      }));
    }

    if (calculator === "paint" && paint) {
      const unitPrice = paint.preset?.unitPriceExVat ?? 0;
      const qty = Math.max(0, areaSqm || 0);
      return [
        {
          name: `${paint.modeLabel} (ปริมาณสีรวม ${paint.litersWithWaste.toFixed(2)} ลิตร)`,
          qty,
          unit: "ตร.ม.",
          imageUrl: paint.preset?.imageUrl ?? null,
          unitPriceExVat: unitPrice,
          totalExVat: unitPrice * qty,
        },
      ];
    }

    if (calculator === "concrete" && concrete) {
      const unitPrice = concrete.preset?.unitPriceExVat ?? 0;
      const qty = Math.max(0, concrete.volumeWithWaste);
      return [
        {
          name: `${concrete.preset?.title ?? "คอนกรีตผสมเสร็จ"} (${concrete.label})`,
          qty,
          unit: "คิว",
          imageUrl: concrete.preset?.imageUrl ?? null,
          unitPriceExVat: unitPrice,
          totalExVat: unitPrice * qty,
        },
      ];
    }

    if (calculator === "brick" && brick) {
      const unitPrice = brick.preset?.unitPriceExVat ?? 0;
      const qty = Math.max(0, brick.areaWithWaste);
      return [
        {
          name: brick.preset?.title ?? "อิฐก่อผนัง",
          qty,
          unit: "ตร.ม.",
          imageUrl: brick.preset?.imageUrl ?? null,
          unitPriceExVat: unitPrice,
          totalExVat: unitPrice * qty,
        },
      ];
    }

    if (calculator === "metal-sheet" && metal) {
      const unitPrice = metal.preset?.unitPriceExVat ?? 0;
      const qty = Math.max(0, metal.areaWithWaste);
      return [
        {
          name: `${metal.preset?.title ?? "เมทัลชีท"} (${metal.roofStyle === "gable" ? "หน้าจั่ว" : "เพิงหมาแหงน"})`,
          qty,
          unit: "ตร.ม.",
          imageUrl: metal.preset?.imageUrl ?? null,
          unitPriceExVat: unitPrice,
          totalExVat: unitPrice * qty,
        },
      ];
    }

    return [];
  }, [
    calculator,
    constructionData,
    paint,
    areaSqm,
    concrete,
    brick,
    metal,
  ]);

  const rowsPerPage = 9;
  const materialPages = useMemo(() => chunkArray(materialItems, rowsPerPage), [materialItems]);

  const quoteItems = useMemo<EstimateMaterialItem[]>(() => {
    const items: EstimateMaterialItem[] = materialItems.slice();

    items.push({
      name:
        totals.laborWorkType === "wall"
          ? "ค่าแรงติดตั้ง (งานผนัง)"
          : totals.laborWorkType === "roof"
            ? "ค่าแรงติดตั้ง (งานหลังคา)"
            : totals.laborWorkType === "concrete"
              ? "ค่าแรงติดตั้ง (งานคอนกรีต)"
              : totals.laborWorkType === "paint"
                ? "ค่าแรงติดตั้ง (งานสี)"
                : "ค่าแรงติดตั้ง (งานฝ้า/เพดาน)",
      qty: totals.laborQty,
      unit: totals.laborUnitLabel,
      imageUrl: null,
      unitPriceExVat: totals.laborPerSqm,
      totalExVat: totals.laborSubtotal,
    });

    if (includeDemolition) {
      const qty = Math.max(0, demolitionAreaSqm || 0);
      const unitPriceExVat = getLaborPerUnit("demolition", workDifficulty);
      items.push({
        name: "ค่าแรงรื้อถอน",
        qty,
        unit: "ตร.ม.",
        imageUrl: null,
        unitPriceExVat,
        totalExVat: qty * unitPriceExVat,
      });
    }

    if (includeWaste) {
      const qty = Math.max(0, wasteAreaSqm || 0);
      const unitPriceExVat = getLaborPerUnit("waste", workDifficulty);
      items.push({
        name: "ค่าแรงขนทิ้ง",
        qty,
        unit: "ตร.ม.",
        imageUrl: null,
        unitPriceExVat,
        totalExVat: qty * unitPriceExVat,
      });
    }

    items.push({
      name: `ค่าดำเนินงาน (${estimateV2Config.overheadRate * 100}%)`,
      qty: 1,
      unit: "รายการ",
      imageUrl: null,
      unitPriceExVat: totals.overhead,
      totalExVat: totals.overhead,
    });

    return items;
  }, [
    materialItems,
    totals.laborWorkType,
    totals.laborQty,
    totals.laborUnitLabel,
    totals.laborPerSqm,
    totals.laborSubtotal,
    totals.overhead,
    includeDemolition,
    demolitionAreaSqm,
    includeWaste,
    wasteAreaSqm,
    workDifficulty,
  ]);

  const quotePages = useMemo(() => chunkArray(quoteItems, rowsPerPage), [quoteItems]);

  const validateCustomer = () => {
    const errors: Record<string, string> = {};
    if (customerType === "personal") {
      if (!personalName.trim()) errors.personalName = "กรุณากรอกชื่อลูกค้า";
      if (!personalPhone.trim()) errors.personalPhone = "กรุณากรอกเบอร์โทร";
      if (!personalAddress.trim()) errors.personalAddress = "กรุณากรอกที่อยู่";
    } else {
      if (!companyName.trim()) errors.companyName = "กรุณากรอกชื่อบริษัท/นิติบุคคล";
      if (!companyTaxId.trim()) errors.companyTaxId = "กรุณากรอกเลขที่ผู้เสียภาษี";
      if (!companyBranch.trim()) errors.companyBranch = "กรุณากรอกสาขา";
      if (!companyAddress.trim()) errors.companyAddress = "กรุณากรอกที่อยู่บริษัท";
      if (!companyPostcode.trim()) errors.companyPostcode = "กรุณากรอกรหัสไปรษณีย์";
      if (!contactName.trim()) errors.contactName = "กรุณากรอกผู้ติดต่อ";
      if (!contactPhone.trim()) errors.contactPhone = "กรุณากรอกเบอร์โทร";
      if (!contactLineId.trim()) errors.contactLineId = "กรุณากรอกไอดีไลน์";
      if (!siteAddress.trim()) errors.siteAddress = "กรุณากรอกที่อยู่ (หน้างาน)";
    }
    setCustomerFieldErrors(errors);
    return errors;
  };

  const focusFirstCustomerError = (errors: Record<string, string>) => {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;
    const el = customerBlockRef.current?.querySelector(`[data-field="${firstKey}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    } else {
      customerBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const recordLead = async (source: "spec" | "quote") => {
    const payload = {
      source,
      customer_type: customerType,
      customer:
        customerType === "personal"
          ? {
              customer_name: personalName,
              customer_phone: personalPhone,
              customer_address: personalAddress,
            }
          : {
              company_name: companyName,
              company_tax_id: companyTaxId,
              company_branch: companyBranch,
              company_address: companyAddress,
              company_postcode: companyPostcode,
              contact_name: contactName,
              contact_phone: contactPhone,
              contact_line_id: contactLineId,
              site_same_as_company: siteSameAsCompany,
              site_address: siteAddress,
            },
      selection: {
        calculator,
        calculator_title: activeCard.title,
        building_type: buildingType,
        work_difficulty: workDifficulty,
        inputs: {
          area_sqm: areaSqm,
          construction_type: constructionType,
          selections,
          paint_mode: paintMode,
          paint_coats: paintCoats,
          paint_coverage_sqm_per_liter: paintCoverageSqmPerLiter,
          paint_waste_rate: paintWasteRate,
          concrete_element: concreteElement,
          concrete_strength: concreteStrength,
          concrete_waste_rate: concreteWasteRate,
          slab: { length_m: slabLengthM, width_m: slabWidthM, thickness_cm: slabThicknessCm },
          footing: { length_m: footingLengthM, width_m: footingWidthM, height_m: footingHeightM, count: footingCount },
          column: { width_cm: columnWidthCm, depth_cm: columnDepthCm, height_m: columnHeightM, count: columnCount },
          beam: { width_cm: beamWidthCm, depth_cm: beamDepthCm, length_m: beamLengthM, count: beamCount },
          brick: { length_m: brickWallLengthM, height_m: brickWallHeightM, openings_sqm: brickOpeningsSqm, waste_rate: brickWasteRate },
          metal: {
            roof_style: metalRoofStyle,
            length_m: metalLengthM,
            width_m: metalWidthM,
            pitch_deg: metalPitchDeg,
            overhang_m: metalOverhangM,
            waste_rate: metalWasteRate,
            thickness: metalThickness,
          },
          demolition: { include: includeDemolition, area_sqm: demolitionAreaSqm },
          waste: { include: includeWaste, area_sqm: wasteAreaSqm },
        },
        materials: materialItems.map((it) => ({ name: it.name, qty: it.qty, unit: it.unit })),
      },
      totals: {
        material_subtotal: Math.round(totals.materialSubtotal),
        labor_subtotal: Math.round(totals.laborSubtotal),
        demolition_subtotal: Math.round(totals.demolitionSubtotal),
        waste_subtotal: Math.round(totals.wasteSubtotal),
        overhead: Math.round(totals.overhead),
        total_ex_vat: Math.round(totals.totalExVat),
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_with_vat: totalWithVat,
        min_ex_vat: totals.min,
        max_ex_vat: totals.max,
        min_with_vat: minWithVat,
        max_with_vat: maxWithVat,
      },
      page_url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };

    const res = await fetch("/api/estimate-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  };

  const openLoadingTab = () => {
    if (typeof window === "undefined") return null;
    const w = window.open("", "_blank");
    if (w) {
      w.document.title = "กำลังสร้างไฟล์ PDF...";
      w.document.body.innerHTML =
        "<div style='font-family: Sarabun, Tahoma, Arial, sans-serif; padding:16px;'>กำลังสร้างไฟล์ PDF...</div>";
    }
    return w;
  };

  const renderPdfFromRef = async (ref: { current: HTMLDivElement | null }, filename: string, tab: Window | null) => {
    const root = ref.current;
    if (!root) throw new Error("ไม่พบเอกสารสำหรับสร้าง PDF");
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 50));

    const pageEls = Array.from(root.querySelectorAll('[data-pdf-page="true"]')) as HTMLDivElement[];
    const pages = pageEls.length ? pageEls : [root];

    const pdf = new jsPDF("p", "mm", "a4");
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const y = (pageHeight - imgHeight) / 2;
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    }

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    if (tab) tab.location.href = url;
    else window.open(url, "_blank");

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const downloadSpecPdf = async () => {
    const errors = validateCustomer();
    if (Object.keys(errors).length) return focusFirstCustomerError(errors);
    if (!specPdfRef.current) return;

    setDownloadError(null);
    setDownloadStatus((s) => ({ ...s, spec: "generating" }));
    const tab = openLoadingTab();

    try {
      await renderPdfFromRef(specPdfRef, `estimate-spec-${new Date().toISOString().slice(0, 10)}.pdf`, tab);
      setDownloadStatus((s) => ({ ...s, spec: "done" }));
      void recordLead("spec");
    } catch (e) {
      setDownloadStatus((s) => ({ ...s, spec: "error" }));
      setDownloadError(e instanceof Error ? e.message : "สร้างไฟล์ PDF ไม่สำเร็จ");
      if (tab) tab.close();
    }
  };

  const downloadQuotePdf = async () => {
    const errors = validateCustomer();
    if (Object.keys(errors).length) return focusFirstCustomerError(errors);
    if (!quotePdfRef.current) return;

    setDownloadError(null);
    setDownloadStatus((s) => ({ ...s, quote: "generating" }));
    const tab = openLoadingTab();

    try {
      await renderPdfFromRef(quotePdfRef, `estimate-quote-${new Date().toISOString().slice(0, 10)}.pdf`, tab);
      setDownloadStatus((s) => ({ ...s, quote: "done" }));
      void recordLead("quote");
    } catch (e) {
      setDownloadStatus((s) => ({ ...s, quote: "error" }));
      setDownloadError(e instanceof Error ? e.message : "สร้างไฟล์ PDF ไม่สำเร็จ");
      if (tab) tab.close();
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Navbar />

      <section className="pt-24 pb-12 bg-white border-b border-[#d0d7de]">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1f2328] mb-4">
              ประเมินราคาเบื้องต้น
            </h1>
            <p className="text-[#656d76] text-lg">
              เลือกเครื่องคิดเลข → ใส่ปริมาณงาน → ระบบดึงรายการวัสดุแล้วบวกค่าแรง (fix)
              พร้อมค่าดำเนินงาน {estimateV2Config.overheadRate * 100}% (ไม่รวม VAT)
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container space-y-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {onestockCalculatorCards.map((card) => {
              const isActive = card.id === calculator;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setCalculator(card.id);
                    setConstructionError(null);
                  }}
                  className={[
                    "group text-left bg-white border rounded-2xl overflow-hidden transition-all",
                    isActive ? "border-[#0969da] ring-2 ring-[#0969da]/25" : "border-[#d0d7de] hover:border-[#8c959f]",
                    !card.enabled ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div
                    className="p-6"
                    style={{
                      background: `linear-gradient(135deg, ${card.gradient.from} 0%, ${card.gradient.to} 100%)`,
                    }}
                  >
                    <div className="h-44 rounded-xl bg-white/20 overflow-hidden flex items-center justify-center">
                      <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[#1f2328] font-bold text-lg">{card.title}</div>
                    <div className="text-[#656d76] text-sm mt-1">{card.description}</div>
                    {!card.enabled && <div className="text-xs text-[#656d76] mt-3">กำลังเชื่อมต่อสูตรจาก OneStockHome</div>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
            <aside
              className="rounded-2xl overflow-hidden p-7 flex flex-col gap-4 min-h-[520px]"
              style={{
                background: `linear-gradient(180deg, ${activeCard.gradient.from} 0%, ${activeCard.gradient.to} 100%)`,
              }}
            >
              <div className="text-white text-4xl font-bold leading-tight">{activeCard.title}</div>
              <div className="text-white/90 text-sm leading-relaxed">{activeCard.description}</div>
              {calculator === "construction" && (
                <div className="text-white/90 text-sm">
                  ฉาบเรียบ-โปรลายน์ / ฉาบเรียบ-โปรลายน์พลัส / ที-บาร์ 60x60 / ที-บาร์ 60x120 / ผนังยิปซัม /
                  ผนังวอลล์ไลน์นิ่งติดกาว / ผนังวอลล์ไลน์นิ่งซีไลน์
                </div>
              )}
              <div className="flex-1" />
              <div className="rounded-xl bg-white/15 overflow-hidden">
                <img src={activeCard.imageUrl} alt={activeCard.title} className="w-full h-72 object-cover" />
              </div>
            </aside>

            <div className="space-y-6">
              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="grid gap-4 items-end">
                  <div className="grid gap-2">
                    <label className="text-[#1f2328] text-sm font-bold">
                      {calculator === "paint"
                        ? "พื้นที่ทาสี (ตารางเมตร)"
                        : calculator === "concrete"
                          ? "ขนาดชิ้นงานคอนกรีต"
                          : calculator === "brick"
                            ? "ขนาดผนัง (เมตร)"
                            : calculator === "metal-sheet"
                              ? "ขนาดหลังคา (เมตร)"
                          : "จำนวนพื้นที่ก่อสร้าง (ตารางเมตร)"}
                    </label>
                    {(calculator === "construction" || calculator === "paint") && (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          value={areaSqm}
                          onChange={(e) => setAreaSqm(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                        />
                        <div className="text-[#656d76] text-sm min-w-[52px] text-right">ตร.ม.</div>
                      </div>
                    )}
                    {calculator === "concrete" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ประเภทชิ้นงาน</label>
                          <select
                            value={concreteElement}
                            onChange={(e) =>
                              setConcreteElement(e.target.value as "slab" | "footing" | "column" | "beam")
                            }
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                          >
                            <option value="slab">พื้น/สแลบ</option>
                            <option value="footing">ฐานราก/ตอม่อ</option>
                            <option value="column">เสา</option>
                            <option value="beam">คาน</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">กำลังอัดคอนกรีต</label>
                          <select
                            value={concreteStrength}
                            onChange={(e) => setConcreteStrength(e.target.value as "180" | "210" | "240" | "280")}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                          >
                            <option value="180">180 KSC</option>
                            <option value="210">210 KSC</option>
                            <option value="240">240 KSC</option>
                            <option value="280">280 KSC</option>
                          </select>
                        </div>

                        {concreteElement === "slab" && (
                          <>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">ยาว (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={slabLengthM}
                                onChange={(e) => setSlabLengthM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">กว้าง (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={slabWidthM}
                                onChange={(e) => setSlabWidthM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">หนา (ซม.)</label>
                              <input
                                type="number"
                                min={0}
                                value={slabThicknessCm}
                                onChange={(e) => setSlabThicknessCm(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                              <input
                                type="number"
                                min={0}
                                value={concreteWasteRate}
                                onChange={(e) => setConcreteWasteRate(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                          </>
                        )}

                        {concreteElement === "footing" && (
                          <>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">ยาว (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={footingLengthM}
                                onChange={(e) => setFootingLengthM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">กว้าง (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={footingWidthM}
                                onChange={(e) => setFootingWidthM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">สูง (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={footingHeightM}
                                onChange={(e) => setFootingHeightM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">จำนวนชิ้น</label>
                              <input
                                type="number"
                                min={0}
                                value={footingCount}
                                onChange={(e) => setFootingCount(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                              <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                              <input
                                type="number"
                                min={0}
                                value={concreteWasteRate}
                                onChange={(e) => setConcreteWasteRate(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                          </>
                        )}

                        {concreteElement === "column" && (
                          <>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">กว้าง (ซม.)</label>
                              <input
                                type="number"
                                min={0}
                                value={columnWidthCm}
                                onChange={(e) => setColumnWidthCm(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">ลึก (ซม.)</label>
                              <input
                                type="number"
                                min={0}
                                value={columnDepthCm}
                                onChange={(e) => setColumnDepthCm(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">สูง (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={columnHeightM}
                                onChange={(e) => setColumnHeightM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">จำนวนต้น</label>
                              <input
                                type="number"
                                min={0}
                                value={columnCount}
                                onChange={(e) => setColumnCount(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                              <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                              <input
                                type="number"
                                min={0}
                                value={concreteWasteRate}
                                onChange={(e) => setConcreteWasteRate(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                          </>
                        )}

                        {concreteElement === "beam" && (
                          <>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">กว้าง (ซม.)</label>
                              <input
                                type="number"
                                min={0}
                                value={beamWidthCm}
                                onChange={(e) => setBeamWidthCm(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">ลึก (ซม.)</label>
                              <input
                                type="number"
                                min={0}
                                value={beamDepthCm}
                                onChange={(e) => setBeamDepthCm(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">ยาว (เมตร)</label>
                              <input
                                type="number"
                                min={0}
                                value={beamLengthM}
                                onChange={(e) => setBeamLengthM(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs text-[#656d76]">จำนวนเส้น</label>
                              <input
                                type="number"
                                min={0}
                                value={beamCount}
                                onChange={(e) => setBeamCount(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                              <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                              <input
                                type="number"
                                min={0}
                                value={concreteWasteRate}
                                onChange={(e) => setConcreteWasteRate(Number(e.target.value) || 0)}
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                              />
                            </div>
                          </>
                        )}

                        <div className="md:col-span-2 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                          <div className="text-xs text-[#656d76]">ปริมาตรคอนกรีต (รวมเผื่อ)</div>
                          <div className="text-[#1f2328] font-bold text-lg mt-1">
                            {concrete ? `${concrete.volumeWithWaste.toFixed(2)} คิว (ม³)` : "0.00 คิว (ม³)"}
                          </div>
                        </div>
                      </div>
                    )}
                    {calculator === "brick" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ยาว (เมตร)</label>
                          <input
                            type="number"
                            min={0}
                            value={brickWallLengthM}
                            onChange={(e) => setBrickWallLengthM(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">สูง (เมตร)</label>
                          <input
                            type="number"
                            min={0}
                            value={brickWallHeightM}
                            onChange={(e) => setBrickWallHeightM(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">พื้นที่ช่องเปิด (ตร.ม.)</label>
                          <input
                            type="number"
                            min={0}
                            value={brickOpeningsSqm}
                            onChange={(e) => setBrickOpeningsSqm(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                          <input
                            type="number"
                            min={0}
                            value={brickWasteRate}
                            onChange={(e) => setBrickWasteRate(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>

                        <div className="md:col-span-2 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                          <div className="text-xs text-[#656d76]">พื้นที่ผนัง (รวมเผื่อ)</div>
                          <div className="text-[#1f2328] font-bold text-lg mt-1">
                            {brick ? `${brick.areaWithWaste.toFixed(2)} ตร.ม.` : "0.00 ตร.ม."}
                          </div>
                          <div className="text-xs text-[#656d76] mt-1">
                            จำนวนอิฐประมาณ {brick ? formatTHB(Math.round(brick.pieces)) : "0"} ก้อน (อัตรา {brick?.piecesPerSqm ?? 8.33} ก้อน/ตร.ม.)
                          </div>
                        </div>
                      </div>
                    )}
                    {calculator === "metal-sheet" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ทรงหลังคา</label>
                          <select
                            value={metalRoofStyle}
                            onChange={(e) => setMetalRoofStyle(e.target.value as "single" | "gable")}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                          >
                            <option value="gable">หน้าจั่ว</option>
                            <option value="single">เพิงหมาแหงน</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ความหนาเมทัลชีท</label>
                          <select
                            value={metalThickness}
                            onChange={(e) => setMetalThickness(e.target.value as "035" | "040" | "047" | "050")}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                          >
                            <option value="035">0.35 มม.</option>
                            <option value="040">0.40 มม.</option>
                            <option value="047">0.47 มม.</option>
                            <option value="050">0.50 มม.</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ยาว (เมตร)</label>
                          <input
                            type="number"
                            min={0}
                            value={metalLengthM}
                            onChange={(e) => setMetalLengthM(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">กว้าง (เมตร)</label>
                          <input
                            type="number"
                            min={0}
                            value={metalWidthM}
                            onChange={(e) => setMetalWidthM(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">pitch (องศา)</label>
                          <input
                            type="number"
                            min={0}
                            value={metalPitchDeg}
                            onChange={(e) => setMetalPitchDeg(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">กันสาด (เมตร)</label>
                          <input
                            type="number"
                            min={0}
                            value={metalOverhangM}
                            onChange={(e) => setMetalOverhangM(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                          <input
                            type="number"
                            min={0}
                            value={metalWasteRate}
                            onChange={(e) => setMetalWasteRate(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                        </div>

                        <div className="md:col-span-2 border border-[#d0d7de] rounded-xl p-4 bg-[#f6f8fa]">
                          <div className="text-xs text-[#656d76]">พื้นที่หลังคาเมทัลชีท (รวมเผื่อ)</div>
                          <div className="text-[#1f2328] font-bold text-lg mt-1">
                            {metal ? `${metal.areaWithWaste.toFixed(2)} ตร.ม.` : "0.00 ตร.ม."}
                          </div>
                          <div className="text-xs text-[#656d76] mt-1">
                            แผ่นประมาณ {metal ? formatTHB(metal.totalSheetsWithWaste) : "0"} แผ่น • ยาวแผ่น {metal ? metal.slopeLength.toFixed(2) : "0.00"} ม. •
                            แผ่น/ด้าน {metal ? metal.sheetsPerSide : 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">ประเภทงาน</label>
                  {calculator === "construction" && (
                    <div className="flex flex-wrap gap-2">
                      {(constructionData?.types?.length ? constructionData.types : Object.keys(constructionTypeLabel)).map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setConstructionType(t)}
                            className={[
                              "px-4 py-2 rounded-lg border text-sm transition-all",
                              t === constructionType
                                ? "bg-[#e7f0ff] border-[#0969da] text-[#0969da]"
                                : "bg-white border-[#d0d7de] text-[#1f2328] hover:border-[#8c959f]",
                            ].join(" ")}
                          >
                            {constructionTypeLabel[t] ?? t}
                          </button>
                        )
                      )}
                    </div>
                  )}
                  {calculator === "paint" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">ประเภทสี</label>
                        <select
                          value={paintMode}
                          onChange={(e) => setPaintMode(e.target.value as "interior" | "exterior")}
                          className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        >
                          <option value="interior">สีทาภายใน</option>
                          <option value="exterior">สีทาภายนอก</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">จำนวนเที่ยวทา</label>
                        <input
                          type="number"
                          min={1}
                          value={paintCoats}
                          onChange={(e) => setPaintCoats(Number(e.target.value) || 1)}
                          className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">อัตราการปกคลุม (ตร.ม./ลิตร/เที่ยวทา)</label>
                        <input
                          type="number"
                          min={1}
                          value={paintCoverageSqmPerLiter}
                          onChange={(e) => setPaintCoverageSqmPerLiter(Number(e.target.value) || 10)}
                          className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">เผื่อสูญเสีย (%)</label>
                        <input
                          type="number"
                          min={0}
                          value={paintWasteRate}
                          onChange={(e) => setPaintWasteRate(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                        />
                      </div>
                      <div className="md:col-span-2 text-xs text-[#656d76]">
                        ระบบจะคำนวณปริมาณสีรวมจาก พื้นที่ × เที่ยวทา ÷ อัตราการปกคลุม และเผื่อสูญเสียตามที่กำหนด
                      </div>
                    </div>
                  )}
                  {calculator === "concrete" && (
                    <div className="text-sm text-[#656d76]">
                      {concrete
                        ? `คำนวณปริมาตร: ${concrete.label} • ${concrete.volumeWithWaste.toFixed(2)} คิว (ม³)`
                        : "ใส่ขนาดชิ้นงานเพื่อคำนวณปริมาตร"}
                    </div>
                  )}
                  {calculator === "brick" && (
                    <div className="text-sm text-[#656d76]">
                      {brick
                        ? `คำนวณผนัง: ${brick.areaWithWaste.toFixed(2)} ตร.ม. • อิฐประมาณ ${formatTHB(Math.round(brick.pieces))} ก้อน`
                        : "ใส่ขนาดผนังเพื่อคำนวณพื้นที่"}
                    </div>
                  )}
                  {calculator === "metal-sheet" && (
                    <div className="text-sm text-[#656d76]">
                      {metal
                        ? `คำนวณหลังคา: ${metal.areaWithWaste.toFixed(2)} ตร.ม. • แผ่นประมาณ ${formatTHB(metal.totalSheetsWithWaste)} แผ่น`
                        : "ใส่ขนาดหลังคาเพื่อคำนวณพื้นที่"}
                    </div>
                  )}
                  {calculator !== "construction" &&
                    calculator !== "paint" &&
                    calculator !== "concrete" &&
                    calculator !== "brick" &&
                    calculator !== "metal-sheet" && (
                    <div className="text-sm text-[#656d76]">
                      กำลังเชื่อมต่อสูตรจาก OneStockHome สำหรับเครื่องคิดเลขนี้
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="text-[#1f2328] text-sm font-bold">ประเภทอาคาร</label>
                    <select
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      {buildingTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[#1f2328] text-sm font-bold">ความสะดวกในการทำงาน (มีผลกับค่าแรง)</label>
                    <select
                      value={workDifficulty}
                      onChange={(e) => setWorkDifficulty(e.target.value as WorkDifficulty)}
                      className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    >
                      {workDifficulties.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-[#656d76]">
                      ใช้กรณีพื้นที่สูง/นั่งร้าน/งาน safety/ต้องขนของขึ้น/ใช้โฟลกลิฟต์-กรรไกรยก (x-lift) ฯลฯ
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[#1f2328] text-sm font-bold">งานรื้อถอด</div>
                      <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                        <input
                          type="checkbox"
                          className="accent-[#0969da]"
                          checked={includeDemolition}
                          onChange={(e) => setIncludeDemolition(e.target.checked)}
                        />
                        รวม
                      </label>
                    </div>
                    {includeDemolition && (
                      <div className="mt-3 grid gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            value={demolitionAreaSqm}
                            onChange={(e) => setDemolitionAreaSqm(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                          <div className="text-[#656d76] text-sm min-w-[52px] text-right">ตร.ม.</div>
                        </div>
                        <div className="text-xs text-[#656d76]">
                          ค่าแรง (fix): {formatTHB(Math.round(getLaborPerUnit("demolition", workDifficulty)))} บาท/ตร.ม.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[#1f2328] text-sm font-bold">งานขนทิ้ง</div>
                      <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                        <input
                          type="checkbox"
                          className="accent-[#0969da]"
                          checked={includeWaste}
                          onChange={(e) => setIncludeWaste(e.target.checked)}
                        />
                        รวม
                      </label>
                    </div>
                    {includeWaste && (
                      <div className="mt-3 grid gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            value={wasteAreaSqm}
                            onChange={(e) => setWasteAreaSqm(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all text-right"
                          />
                          <div className="text-[#656d76] text-sm min-w-[52px] text-right">ตร.ม.</div>
                        </div>
                        <div className="text-xs text-[#656d76]">
                          ค่าแรง (fix): {formatTHB(Math.round(getLaborPerUnit("waste", workDifficulty)))} บาท/ตร.ม.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <div className="text-[#1f2328] font-bold">รายการสินค้า</div>
                    <div className="text-sm text-[#656d76]">
                      {calculator === "construction"
                        ? `${constructionData?.rows?.length ?? 0} รายการ`
                        : calculator === "paint"
                          ? `${paint?.plan?.length ?? 0} รายการ`
                          : calculator === "concrete"
                            ? "1 รายการ"
                            : calculator === "brick"
                              ? "1 รายการ"
                              : calculator === "metal-sheet"
                                ? "1 รายการ"
                          : "0 รายการ"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <a
                      href="https://line.me/ti/p/~0900072977"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary px-4 py-2.5 text-sm whitespace-nowrap"
                    >
                      ติดต่อ LINE
                    </a>
                    <button
                      type="button"
                      onClick={downloadSpecPdf}
                      disabled={downloadStatus.spec === "generating"}
                      className="btn-blue px-4 py-2.5 text-sm whitespace-nowrap disabled:opacity-60"
                    >
                      {downloadStatus.spec === "generating" ? "กำลังสร้างสเปค..." : "ดาวน์โหลดเอกสารสเปค"}
                    </button>
                    <button
                      type="button"
                      onClick={downloadQuotePdf}
                      disabled={downloadStatus.quote === "generating"}
                      className="btn-blue px-4 py-2.5 text-sm whitespace-nowrap disabled:opacity-60"
                    >
                      {downloadStatus.quote === "generating" ? "กำลังสร้างใบเสนอราคา..." : "ดาวน์โหลดใบเสนอราคา"}
                    </button>
                  </div>
                </div>

                {downloadError ? <div className="mt-4 text-sm text-red-600 break-words">{downloadError}</div> : null}

                <div ref={customerBlockRef} className="mt-5 border border-[#d0d7de] rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[#1f2328] font-bold text-sm">ข้อมูลลูกค้า</div>
                    <div className="flex items-center gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="customer_type"
                          className="accent-[#0969da]"
                          checked={customerType === "personal"}
                          onChange={() => setCustomerType("personal")}
                        />
                        บุคคลธรรมดา
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="customer_type"
                          className="accent-[#0969da]"
                          checked={customerType === "company"}
                          onChange={() => setCustomerType("company")}
                        />
                        นิติบุคคล/บริษัท/องค์กร
                      </label>
                    </div>
                  </div>

                  {customerType === "personal" ? (
                    <div className="mt-4 grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ชื่อลูกค้า</label>
                          <input
                            data-field="personalName"
                            value={personalName}
                            onChange={(e) => {
                              setPersonalName(e.target.value);
                              if (customerFieldErrors.personalName)
                                setCustomerFieldErrors((p) => ({ ...p, personalName: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.personalName
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.personalName ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.personalName}</div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">เบอร์โทร</label>
                          <input
                            data-field="personalPhone"
                            value={personalPhone}
                            onChange={(e) => {
                              setPersonalPhone(e.target.value);
                              if (customerFieldErrors.personalPhone)
                                setCustomerFieldErrors((p) => ({ ...p, personalPhone: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.personalPhone
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.personalPhone ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.personalPhone}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">ที่อยู่</label>
                        <textarea
                          data-field="personalAddress"
                          rows={2}
                          value={personalAddress}
                          onChange={(e) => {
                            setPersonalAddress(e.target.value);
                            if (customerFieldErrors.personalAddress)
                              setCustomerFieldErrors((p) => ({ ...p, personalAddress: "" }));
                          }}
                          className={[
                            "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all resize-none",
                            customerFieldErrors.personalAddress
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                              : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                          ].join(" ")}
                        />
                        {customerFieldErrors.personalAddress ? (
                          <div className="text-xs text-red-600">{customerFieldErrors.personalAddress}</div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ชื่อบริษัท/นิติบุคคล</label>
                          <input
                            data-field="companyName"
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              if (customerFieldErrors.companyName)
                                setCustomerFieldErrors((p) => ({ ...p, companyName: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.companyName
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.companyName ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.companyName}</div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">เลขที่ผู้เสียภาษี</label>
                          <input
                            data-field="companyTaxId"
                            value={companyTaxId}
                            onChange={(e) => {
                              setCompanyTaxId(e.target.value);
                              if (customerFieldErrors.companyTaxId)
                                setCustomerFieldErrors((p) => ({ ...p, companyTaxId: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.companyTaxId
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.companyTaxId ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.companyTaxId}</div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">สาขา</label>
                          <input
                            data-field="companyBranch"
                            value={companyBranch}
                            onChange={(e) => {
                              setCompanyBranch(e.target.value);
                              if (customerFieldErrors.companyBranch)
                                setCustomerFieldErrors((p) => ({ ...p, companyBranch: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.companyBranch
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.companyBranch ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.companyBranch}</div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">รหัสไปรษณีย์</label>
                          <input
                            data-field="companyPostcode"
                            value={companyPostcode}
                            onChange={(e) => {
                              setCompanyPostcode(e.target.value);
                              if (customerFieldErrors.companyPostcode)
                                setCustomerFieldErrors((p) => ({ ...p, companyPostcode: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.companyPostcode
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.companyPostcode ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.companyPostcode}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">ที่อยู่ (บริษัท)</label>
                        <textarea
                          data-field="companyAddress"
                          rows={2}
                          value={companyAddress}
                          onChange={(e) => {
                            setCompanyAddress(e.target.value);
                            if (customerFieldErrors.companyAddress)
                              setCustomerFieldErrors((p) => ({ ...p, companyAddress: "" }));
                          }}
                          className={[
                            "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all resize-none",
                            customerFieldErrors.companyAddress
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                              : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                          ].join(" ")}
                        />
                        {customerFieldErrors.companyAddress ? (
                          <div className="text-xs text-red-600">{customerFieldErrors.companyAddress}</div>
                        ) : null}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ผู้ติดต่อ</label>
                          <input
                            data-field="contactName"
                            value={contactName}
                            onChange={(e) => {
                              setContactName(e.target.value);
                              if (customerFieldErrors.contactName)
                                setCustomerFieldErrors((p) => ({ ...p, contactName: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.contactName
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.contactName ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.contactName}</div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">เบอร์โทร</label>
                          <input
                            data-field="contactPhone"
                            value={contactPhone}
                            onChange={(e) => {
                              setContactPhone(e.target.value);
                              if (customerFieldErrors.contactPhone)
                                setCustomerFieldErrors((p) => ({ ...p, contactPhone: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.contactPhone
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.contactPhone ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.contactPhone}</div>
                          ) : null}
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs text-[#656d76]">ไอดีไลน์</label>
                          <input
                            data-field="contactLineId"
                            value={contactLineId}
                            onChange={(e) => {
                              setContactLineId(e.target.value);
                              if (customerFieldErrors.contactLineId)
                                setCustomerFieldErrors((p) => ({ ...p, contactLineId: "" }));
                            }}
                            className={[
                              "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all",
                              customerFieldErrors.contactLineId
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                            ].join(" ")}
                          />
                          {customerFieldErrors.contactLineId ? (
                            <div className="text-xs text-red-600">{customerFieldErrors.contactLineId}</div>
                          ) : null}
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                        <input
                          type="checkbox"
                          className="accent-[#0969da]"
                          checked={siteSameAsCompany}
                          onChange={(e) => setSiteSameAsCompany(e.target.checked)}
                        />
                        ที่อยู่ (หน้างาน) เหมือนที่อยู่ (บริษัท)
                      </label>

                      <div className="grid gap-2">
                        <label className="text-xs text-[#656d76]">ที่อยู่ (หน้างาน)</label>
                        <textarea
                          data-field="siteAddress"
                          rows={2}
                          value={siteAddress}
                          disabled={siteSameAsCompany}
                          onChange={(e) => {
                            setSiteAddress(e.target.value);
                            if (customerFieldErrors.siteAddress)
                              setCustomerFieldErrors((p) => ({ ...p, siteAddress: "" }));
                          }}
                          className={[
                            "w-full bg-white border rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none transition-all resize-none disabled:bg-[#f6f8fa]",
                            customerFieldErrors.siteAddress
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                              : "border-[#d0d7de] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                          ].join(" ")}
                        />
                        {customerFieldErrors.siteAddress ? (
                          <div className="text-xs text-red-600">{customerFieldErrors.siteAddress}</div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {calculator === "construction" && constructionError && (
                  <div className="mt-4 text-sm text-red-600 break-words">{constructionError}</div>
                )}

                {calculator === "construction" && (
                  <div className="mt-5 overflow-x-auto border border-[#d0d7de] rounded-xl">
                    <table className="min-w-[900px] w-full text-sm">
                      <thead className="bg-[#f6f8fa] text-[#1f2328]">
                        <tr>
                          <th className="text-left font-bold px-4 py-3 w-[56px]">#</th>
                          <th className="text-left font-bold px-4 py-3">รายการสินค้า</th>
                          <th className="text-right font-bold px-4 py-3 w-[160px]">ราคา/หน่วย (บาท)</th>
                          <th className="text-right font-bold px-4 py-3 w-[140px]">จำนวน</th>
                          <th className="text-right font-bold px-4 py-3 w-[160px]">รวม (บาท)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d0d7de]">
                        {(constructionData?.rows ?? []).map((row, idx) => {
                          const selected = selections[row.key] ?? row.selectedSku;
                          return (
                            <tr key={row.key} className="align-top">
                              <td className="px-4 py-4 text-[#1f2328] font-semibold">{idx + 1})</td>
                              <td className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                    {row.imageUrl ? (
                                      <img src={row.imageUrl} alt={row.name ?? row.key} className="w-full h-full object-contain bg-white" />
                                    ) : null}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[#0969da] font-semibold">
                                      {row.name ?? row.key}
                                    </div>
                                    <div className="mt-2">
                                      <select
                                        value={selected}
                                        onChange={(e) =>
                                          setSelections((prev) => ({
                                            ...prev,
                                            [row.key]: e.target.value,
                                          }))
                                        }
                                        className="w-full bg-white border border-[#d0d7de] rounded-md px-3 py-2 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                                      >
                                        {(row.skuOptionDetails?.length ? row.skuOptionDetails : row.skuOptions.map((sku) => ({ sku, name: null }))).map(
                                          (opt) => (
                                            <option key={opt.sku} value={opt.sku}>
                                              {opt.name ? `${opt.sku} — ${opt.name}` : opt.sku}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right text-[#1f2328]">
                                {formatTHB(Math.round(row.unitPrice))}
                              </td>
                              <td className="px-4 py-4 text-right text-[#1f2328]">
                                {formatTHB(row.qty)} {row.unit}
                              </td>
                              <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                                {formatTHB(Math.round(row.total))}
                              </td>
                            </tr>
                          );
                        })}
                        {constructionLoading && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-[#656d76]">
                              กำลังโหลดรายการวัสดุ...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {calculator === "paint" && paint && (
                  <div className="mt-5 space-y-4">
                    <div className="border border-[#d0d7de] rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[#1f2328] font-bold">{paint.modeLabel}</div>
                        <div className="text-sm text-[#656d76]">
                          {paint.area} ตร.ม. • {paint.coats} เที่ยวทา • เผื่อ {Math.round(paint.wasteRate * 100)}%
                        </div>
                      </div>
                      <div className="mt-2 text-[#1f2328] text-lg font-bold">
                        ปริมาณสีรวม: {paint.litersWithWaste.toFixed(2)} ลิตร
                      </div>
                      <div className="text-xs text-[#656d76] mt-1">
                        ไม่รวมเผื่อ: {paint.liters.toFixed(2)} ลิตร • เกินจากที่ต้องใช้ประมาณ {paint.excess.toFixed(2)} ลิตร (จากการจัดขนาดถัง)
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#d0d7de] rounded-xl">
                      <table className="min-w-[520px] w-full text-sm">
                        <thead className="bg-[#f6f8fa] text-[#1f2328]">
                          <tr>
                            <th className="text-left font-bold px-4 py-3 w-[84px]">รูป</th>
                            <th className="text-left font-bold px-4 py-3">ขนาดถัง (ลิตร)</th>
                            <th className="text-right font-bold px-4 py-3">จำนวน (ถัง)</th>
                            <th className="text-right font-bold px-4 py-3">ปริมาณรวม (ลิตร)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d0d7de]">
                          {paint.plan
                            .slice()
                            .sort((a, b) => b.size - a.size)
                            .map((p) => (
                              <tr key={p.size}>
                                <td className="px-4 py-3">
                                  <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden">
                                    {paint.preset?.imageUrl ? (
                                      <img src={paint.preset.imageUrl} alt={paint.modeLabel} className="w-full h-full object-contain bg-white" />
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-[#1f2328] font-semibold">{p.size}</td>
                                <td className="px-4 py-3 text-right text-[#1f2328]">{p.count}</td>
                                <td className="px-4 py-3 text-right text-[#1f2328] font-semibold">
                                  {Number((p.size * p.count).toFixed(2))}
                                </td>
                              </tr>
                            ))}
                          {!paint.plan.length && (
                            <tr>
                              <td colSpan={4} className="px-4 py-6 text-center text-[#656d76]">
                                ใส่พื้นที่ให้มากกว่า 0 เพื่อคำนวณ
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {calculator === "concrete" && concrete && (
                  <div className="mt-5 overflow-x-auto border border-[#d0d7de] rounded-xl">
                    <table className="min-w-[700px] w-full text-sm">
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
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                {concrete.preset?.imageUrl ? (
                                  <img
                                    src={concrete.preset.imageUrl}
                                    alt={concrete.preset.title}
                                    className="w-full h-full object-contain bg-white"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[#0969da] font-semibold">
                                  {concrete.preset?.title ?? "คอนกรีตผสมเสร็จ"}
                                </div>
                                <div className="text-xs text-[#656d76] mt-1">{concrete.label}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">
                            {formatTHB(Math.round(concrete.preset?.unitPriceExVat ?? 0))}
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">
                            {concrete.volumeWithWaste.toFixed(2)} คิว
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                            {formatTHB(Math.round((concrete.preset?.unitPriceExVat ?? 0) * concrete.volumeWithWaste))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {calculator === "brick" && brick && (
                  <div className="mt-5 overflow-x-auto border border-[#d0d7de] rounded-xl">
                    <table className="min-w-[820px] w-full text-sm">
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
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                {brick.preset?.imageUrl ? (
                                  <img
                                    src={brick.preset.imageUrl}
                                    alt={brick.preset.title}
                                    className="w-full h-full object-contain bg-white"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[#0969da] font-semibold">
                                  {brick.preset?.title ?? "อิฐก่อผนัง"}
                                </div>
                                <div className="text-xs text-[#656d76] mt-1">
                                  ผนัง {brick.length}×{brick.height} ม. • ช่องเปิด {brick.openings} ตร.ม. • เผื่อ {Math.round(brick.wasteRate * 100)}%
                                </div>
                                <div className="text-xs text-[#656d76] mt-1">
                                  จำนวนอิฐประมาณ {formatTHB(Math.round(brick.pieces))} ก้อน
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">
                            {formatTHB(Math.round(brick.preset?.unitPriceExVat ?? 0))}
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">
                            {brick.areaWithWaste.toFixed(2)} ตร.ม.
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                            {formatTHB(Math.round((brick.preset?.unitPriceExVat ?? 0) * brick.areaWithWaste))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {calculator === "metal-sheet" && metal && (
                  <div className="mt-5 overflow-x-auto border border-[#d0d7de] rounded-xl">
                    <table className="min-w-[860px] w-full text-sm">
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
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white border-[4px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                {metal.preset?.imageUrl ? (
                                  <img
                                    src={metal.preset.imageUrl}
                                    alt={metal.preset.title}
                                    className="w-full h-full object-contain bg-white"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[#0969da] font-semibold">
                                  {metal.preset?.title ?? "เมทัลชีท"}
                                </div>
                                <div className="text-xs text-[#656d76] mt-1">
                                  {metal.roofStyle === "gable" ? "หน้าจั่ว" : "เพิงหมาแหงน"} • {metal.length}×{metal.width} ม. • pitch {metal.pitchDeg}° • กันสาด {metal.overhang} ม. •
                                  เผื่อ {Math.round(metal.wasteRate * 100)}%
                                </div>
                                <div className="text-xs text-[#656d76] mt-1">
                                  แผ่นประมาณ {formatTHB(metal.totalSheetsWithWaste)} แผ่น • ยาวแผ่น {metal.slopeLength.toFixed(2)} ม. • แผ่น/ด้าน {metal.sheetsPerSide}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">
                            {formatTHB(Math.round(metal.preset?.unitPriceExVat ?? 0))}
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328]">
                            {metal.areaWithWaste.toFixed(2)} ตร.ม.
                          </td>
                          <td className="px-4 py-4 text-right text-[#1f2328] font-semibold">
                            {formatTHB(Math.round((metal.preset?.unitPriceExVat ?? 0) * metal.areaWithWaste))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 grid md:grid-cols-4 gap-4">
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="text-xs text-[#656d76]">ค่าวัสดุ</div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">
                      {formatTHB(Math.round(totals.materialSubtotal))}
                    </div>
                  </div>
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="text-xs text-[#656d76]">
                      ค่าแรง (fix){" "}
                      {totals.laborWorkType === "wall"
                        ? "งานผนัง"
                        : totals.laborWorkType === "roof"
                          ? "งานหลังคา"
                        : totals.laborWorkType === "concrete"
                          ? "งานคอนกรีต"
                        : totals.laborWorkType === "paint"
                          ? "งานสี"
                          : "งานฝ้า/เพดาน"}
                    </div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">
                      {formatTHB(Math.round(totals.laborSubtotal))}
                    </div>
                    <div className="text-xs text-[#656d76] mt-1">
                      {formatTHB(Math.round(totals.laborPerSqm))} บาท/{totals.laborUnitLabel}
                    </div>
                  </div>
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="text-xs text-[#656d76]">VAT 7%</div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">{formatTHB(vatAmount)}</div>
                  </div>
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="text-xs text-[#656d76]">รวมสุทธิ (รวม VAT)</div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">{formatTHB(totalWithVat)}</div>
                    <div className="text-xs text-[#656d76] mt-1">รวม (ไม่รวม VAT): {formatTHB(Math.round(totals.totalExVat))}</div>
                  </div>
                </div>

                <div className="mt-6 bg-[#f6f8fa] border border-[#d0d7de] rounded-xl p-5">
                  <div className="text-[#656d76] text-sm font-semibold uppercase tracking-wider">ช่วงราคาโดยประมาณ (รวม VAT)</div>
                  <div className="text-2xl md:text-3xl font-bold text-[#1f2328] mt-1">
                    {formatTHB(minWithVat)} – {formatTHB(maxWithVat)} บาท
                  </div>
                  <div className="text-[#656d76] text-sm mt-2">
                    รวม VAT 7% และคิดค่าดำเนินงาน {estimateV2Config.overheadRate * 100}% พร้อมเผื่อช่วง {estimateV2Config.bufferRate * 100}%
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <a href="/portfolio?category=ต่อเติมและรีโนเวท" className="btn-secondary w-full py-3 text-base text-center">
                  ดูผลงานประกอบการตัดสินใจ
                </a>
                <a href="/#contact" className="btn-blue w-full py-3 text-base text-center">
                  ปรึกษาฟรี
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed left-[-99999px] top-0 w-[794px]">
        <div ref={specPdfRef} className="grid gap-4" style={{ fontFamily: "'Sarabun', Tahoma, Arial, sans-serif" }}>
          {materialPages.map((pageItems, pageIndex) => {
            const totalPages = materialPages.length;
            return (
              <div
                key={`spec-${pageIndex}`}
                data-pdf-page="true"
                className="bg-white text-[#1f2328]"
                style={{ width: 794, minHeight: 1123, padding: 32, boxSizing: "border-box" }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <img src="/siamai-logo.png" alt="SAT" className="w-14 h-14 object-contain" />
                    <div>
                      <div className="text-lg font-bold leading-tight">SAT (Siam AI Tools)</div>
                      <div className="text-xs text-[#656d76]">เอกสารสเปค / รายการวัสดุ (ประเมินราคาเบื้องต้น)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#656d76]">วันที่</div>
                    <div className="text-sm font-semibold">{new Date().toLocaleDateString("th-TH")}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm">
                  <div className="font-bold">ข้อมูลลูกค้า</div>
                  {customerType === "personal" ? (
                    <div className="grid gap-1 text-[#656d76]">
                      <div>
                        ชื่อลูกค้า: <span className="text-[#1f2328]">{personalName || "-"}</span>
                      </div>
                      <div>
                        เบอร์โทร: <span className="text-[#1f2328]">{personalPhone || "-"}</span>
                      </div>
                      <div>
                        ที่อยู่: <span className="text-[#1f2328]">{personalAddress || "-"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-1 text-[#656d76]">
                      <div>
                        ชื่อบริษัท/นิติบุคคล: <span className="text-[#1f2328]">{companyName || "-"}</span>
                      </div>
                      <div>
                        เลขที่ผู้เสียภาษี: <span className="text-[#1f2328]">{companyTaxId || "-"}</span> • สาขา:{" "}
                        <span className="text-[#1f2328]">{companyBranch || "-"}</span>
                      </div>
                      <div>
                        ที่อยู่ (บริษัท): <span className="text-[#1f2328]">{companyAddress || "-"}</span> •{" "}
                        <span className="text-[#1f2328]">{companyPostcode || "-"}</span>
                      </div>
                      <div>
                        ผู้ติดต่อ: <span className="text-[#1f2328]">{contactName || "-"}</span> • เบอร์โทร:{" "}
                        <span className="text-[#1f2328]">{contactPhone || "-"}</span> • ไอดีไลน์:{" "}
                        <span className="text-[#1f2328]">{contactLineId || "-"}</span>
                      </div>
                      <div>
                        ที่อยู่ (หน้างาน): <span className="text-[#1f2328]">{siteAddress || "-"}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-1 text-sm">
                  <div className="font-bold">รายละเอียดงาน</div>
                  <div className="text-[#656d76]">
                    เครื่องคิดเลข: <span className="text-[#1f2328] font-semibold">{activeCard.title}</span> • ประเภทอาคาร:{" "}
                    <span className="text-[#1f2328]">{buildingType}</span> • ความยากงาน:{" "}
                    <span className="text-[#1f2328]">{workDifficulty}</span>
                  </div>
                  {calculator === "construction" ? (
                    <div className="text-[#656d76]">
                      ประเภทงาน: <span className="text-[#1f2328]">{constructionTypeLabel[constructionType] ?? constructionType}</span> • พื้นที่:{" "}
                      <span className="text-[#1f2328]">{formatTHB(Math.round(areaSqm || 0))}</span> ตร.ม.
                    </div>
                  ) : null}
                  {calculator === "paint" && paint ? (
                    <div className="text-[#656d76]">
                      {paint.modeLabel} • {paint.coats} เที่ยวทา • ปริมาณสีรวม {paint.litersWithWaste.toFixed(2)} ลิตร
                    </div>
                  ) : null}
                  {calculator === "concrete" && concrete ? (
                    <div className="text-[#656d76]">
                      {concrete.label} • {concrete.volumeWithWaste.toFixed(2)} คิว
                    </div>
                  ) : null}
                  {calculator === "brick" && brick ? (
                    <div className="text-[#656d76]">พื้นที่ผนัง {brick.areaWithWaste.toFixed(2)} ตร.ม.</div>
                  ) : null}
                  {calculator === "metal-sheet" && metal ? (
                    <div className="text-[#656d76]">พื้นที่หลังคา {metal.areaWithWaste.toFixed(2)} ตร.ม.</div>
                  ) : null}
                </div>

                <div className="mt-4 border border-[#d0d7de] rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f6f8fa]">
                      <tr>
                        <th className="px-3 py-2 text-left w-[52px]">ลำดับ</th>
                        <th className="px-3 py-2 text-left">รายการวัสดุ</th>
                        <th className="px-3 py-2 text-right w-[120px]">จำนวน</th>
                        <th className="px-3 py-2 text-left w-[80px]">หน่วย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d0d7de]">
                      {pageItems.map((it, idx) => (
                        <tr key={`${pageIndex}-${idx}`} className="align-top">
                          <td className="px-3 py-2">{pageIndex * rowsPerPage + idx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-start gap-2">
                              <div className="w-10 h-10 rounded-md bg-white border-[3px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                {it.imageUrl ? (
                                  <img src={it.imageUrl} alt={it.name} crossOrigin="anonymous" className="w-full h-full object-contain bg-white" />
                                ) : null}
                              </div>
                              <div className="whitespace-normal break-words leading-snug">{it.name}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">{formatTHB(Number(it.qty.toFixed(2)))}</td>
                          <td className="px-3 py-2">{it.unit}</td>
                        </tr>
                      ))}
                      {!pageItems.length ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-[#656d76]">
                            ยังไม่มีรายการวัสดุ
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                {pageIndex === totalPages - 1 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="border border-[#d0d7de] rounded-lg p-4 min-h-[120px]">
                      <div className="text-xs text-[#656d76]">ผู้จัดทำ/เสนอราคา</div>
                      <div className="mt-10 border-t border-[#d0d7de] pt-2">ลงชื่อ ................................................</div>
                    </div>
                    <div className="border border-[#d0d7de] rounded-lg p-4 min-h-[120px]">
                      <div className="text-xs text-[#656d76]">ผู้อนุมัติ/ลูกค้า</div>
                      <div className="mt-10 border-t border-[#d0d7de] pt-2">ลงชื่อ ................................................</div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-between text-xs text-[#656d76]">
                  <div>เงื่อนไขการชำระเงิน: ชำระค่าสินค้า + ค่าแรงติดตั้ง 100%</div>
                  <div>
                    หน้า {pageIndex + 1}/{totalPages}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={quotePdfRef} className="grid gap-4" style={{ fontFamily: "'Sarabun', Tahoma, Arial, sans-serif" }}>
          {quotePages.map((pageItems, pageIndex) => {
            const totalPages = quotePages.length;
            const isLast = pageIndex === totalPages - 1;
            return (
              <div
                key={`quote-${pageIndex}`}
                data-pdf-page="true"
                className="bg-white text-[#1f2328]"
                style={{ width: 794, minHeight: 1123, padding: 32, boxSizing: "border-box" }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <img src="/siamai-logo.png" alt="SAT" className="w-14 h-14 object-contain" />
                    <div>
                      <div className="text-lg font-bold leading-tight">SAT (Siam AI Tools)</div>
                      <div className="text-xs text-[#656d76]">ใบเสนอราคา (ประเมินราคาเบื้องต้น)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#656d76]">วันที่</div>
                    <div className="text-sm font-semibold">{new Date().toLocaleDateString("th-TH")}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm">
                  <div className="font-bold">ข้อมูลลูกค้า</div>
                  {customerType === "personal" ? (
                    <div className="grid gap-1 text-[#656d76]">
                      <div>
                        ชื่อลูกค้า: <span className="text-[#1f2328]">{personalName || "-"}</span>
                      </div>
                      <div>
                        เบอร์โทร: <span className="text-[#1f2328]">{personalPhone || "-"}</span>
                      </div>
                      <div>
                        ที่อยู่: <span className="text-[#1f2328]">{personalAddress || "-"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-1 text-[#656d76]">
                      <div>
                        ชื่อบริษัท/นิติบุคคล: <span className="text-[#1f2328]">{companyName || "-"}</span>
                      </div>
                      <div>
                        เลขที่ผู้เสียภาษี: <span className="text-[#1f2328]">{companyTaxId || "-"}</span> • สาขา:{" "}
                        <span className="text-[#1f2328]">{companyBranch || "-"}</span>
                      </div>
                      <div>
                        ที่อยู่ (บริษัท): <span className="text-[#1f2328]">{companyAddress || "-"}</span> •{" "}
                        <span className="text-[#1f2328]">{companyPostcode || "-"}</span>
                      </div>
                      <div>
                        ผู้ติดต่อ: <span className="text-[#1f2328]">{contactName || "-"}</span> • เบอร์โทร:{" "}
                        <span className="text-[#1f2328]">{contactPhone || "-"}</span> • ไอดีไลน์:{" "}
                        <span className="text-[#1f2328]">{contactLineId || "-"}</span>
                      </div>
                      <div>
                        ที่อยู่ (หน้างาน): <span className="text-[#1f2328]">{siteAddress || "-"}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 border border-[#d0d7de] rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f6f8fa]">
                      <tr>
                        <th className="px-3 py-2 text-left w-[52px]">ลำดับ</th>
                        <th className="px-3 py-2 text-left">รายการ</th>
                        <th className="px-3 py-2 text-right w-[120px]">ราคา/หน่วย</th>
                        <th className="px-3 py-2 text-right w-[110px]">จำนวน</th>
                        <th className="px-3 py-2 text-right w-[120px]">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d0d7de]">
                      {pageItems.map((it, idx) => (
                        <tr key={`${pageIndex}-${idx}`} className="align-top">
                          <td className="px-3 py-2">{pageIndex * rowsPerPage + idx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-start gap-2">
                              <div className="w-10 h-10 rounded-md bg-white border-[3px] border-white shadow-sm ring-1 ring-[#d0d7de] overflow-hidden shrink-0">
                                {it.imageUrl ? (
                                  <img src={it.imageUrl} alt={it.name} crossOrigin="anonymous" className="w-full h-full object-contain bg-white" />
                                ) : null}
                              </div>
                              <div className="whitespace-normal break-words leading-snug">{it.name}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">{formatTHB(Math.round(it.unitPriceExVat))}</td>
                          <td className="px-3 py-2 text-right">
                            {formatTHB(Number(it.qty.toFixed(2)))} {it.unit}
                          </td>
                          <td className="px-3 py-2 text-right">{formatTHB(Math.round(it.totalExVat))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isLast ? (
                  <>
                    <div className="mt-5 grid md:grid-cols-3 gap-3 text-sm">
                      <div className="border border-[#d0d7de] rounded-lg p-3">
                        <div className="text-xs text-[#656d76]">รวม (ไม่รวม VAT)</div>
                        <div className="text-base font-bold">{formatTHB(Math.round(totals.totalExVat))}</div>
                      </div>
                      <div className="border border-[#d0d7de] rounded-lg p-3">
                        <div className="text-xs text-[#656d76]">VAT 7%</div>
                        <div className="text-base font-bold">{formatTHB(vatAmount)}</div>
                      </div>
                      <div className="border border-[#d0d7de] rounded-lg p-3">
                        <div className="text-xs text-[#656d76]">รวมสุทธิ (รวม VAT)</div>
                        <div className="text-base font-bold">{formatTHB(totalWithVat)}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-[#656d76]">
                      ช่วงราคาโดยประมาณ (รวม VAT): {formatTHB(minWithVat)} – {formatTHB(maxWithVat)} บาท • รวมค่าดำเนินงาน{" "}
                      {estimateV2Config.overheadRate * 100}% พร้อมเผื่อช่วง {estimateV2Config.bufferRate * 100}%
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div className="border border-[#d0d7de] rounded-lg p-4 min-h-[120px]">
                        <div className="text-xs text-[#656d76]">ผู้จัดทำ/เสนอราคา</div>
                        <div className="mt-10 border-t border-[#d0d7de] pt-2">ลงชื่อ ................................................</div>
                      </div>
                      <div className="border border-[#d0d7de] rounded-lg p-4 min-h-[120px]">
                        <div className="text-xs text-[#656d76]">ผู้อนุมัติ/ลูกค้า</div>
                        <div className="mt-10 border-t border-[#d0d7de] pt-2">ลงชื่อ ................................................</div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="mt-6 flex items-center justify-between text-xs text-[#656d76]">
                  <div>เงื่อนไขการชำระเงิน: ชำระค่าสินค้า + ค่าแรงติดตั้ง 100%</div>
                  <div>
                    หน้า {pageIndex + 1}/{totalPages}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
