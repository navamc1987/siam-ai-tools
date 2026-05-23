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
import { useEffect, useMemo, useState } from "react";

function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
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

  const handleContact = () => {
    const message = [
      "ขอประเมินราคาเบื้องต้น",
      `ประเภทอาคาร: ${buildingType}`,
      `ความสะดวกในการทำงาน: ${workDifficulty}`,
      "",
      `เครื่องคิดเลข: ${activeCard.title}`,
      calculator === "construction"
        ? `ประเภทงาน: ${constructionTypeLabel[constructionType] ?? constructionType}`
        : "",
      calculator === "paint" && paint
        ? [
            `ประเภทสี: ${paint.modeLabel}`,
            `เที่ยวทา: ${paint.coats}`,
            `อัตราการปกคลุม: ${paint.coverage} ตร.ม./ลิตร/เที่ยวทา`,
            `เผื่อสูญเสีย: ${Math.round(paint.wasteRate * 100)}%`,
            `ปริมาณสีรวม: ${paint.litersWithWaste.toFixed(2)} ลิตร`,
            paint.plan.length
              ? `แนะนำขนาดถัง: ${paint.plan
                  .slice()
                  .sort((a, b) => b.size - a.size)
                  .map((p) => `${p.size}L x ${p.count}`)
                  .join(", ")}`
              : "",
          ].filter(Boolean).join("\n")
        : "",
      calculator === "concrete" && concrete
        ? [
            `รายการ: ${concrete.label}`,
            `กำลังอัด: ${concrete.strength} KSC`,
            `เผื่อสูญเสีย: ${Math.round(concrete.wasteRate * 100)}%`,
            `ปริมาตรคอนกรีต: ${concrete.volumeWithWaste.toFixed(2)} คิว (ม³)`,
          ].join("\n")
        : "",
      calculator === "brick" && brick
        ? [
            `ผนัง: ${brick.length}×${brick.height} ม.`,
            `ช่องเปิด: ${brick.openings} ตร.ม.`,
            `เผื่อสูญเสีย: ${Math.round(brick.wasteRate * 100)}%`,
            `พื้นที่ผนัง: ${brick.areaWithWaste.toFixed(2)} ตร.ม.`,
            `จำนวนอิฐประมาณ: ${Math.round(brick.pieces)} ก้อน`,
          ].join("\n")
        : "",
      calculator === "metal-sheet" && metal
        ? [
            `ทรงหลังคา: ${metal.roofStyle === "gable" ? "หน้าจั่ว" : "เพิงหมาแหงน"}`,
            `ความหนา: ${metal.thickness} มม.`,
            `pitch: ${metal.pitchDeg}°`,
            `กันสาด: ${metal.overhang} ม.`,
            `พื้นที่หลังคา: ${metal.areaWithWaste.toFixed(2)} ตร.ม.`,
            `จำนวนแผ่นประมาณ: ${metal.totalSheetsWithWaste} แผ่น`,
          ].join("\n")
        : "",
      calculator === "construction" || calculator === "paint"
        ? `พื้นที่: ${formatTHB(Math.round(areaSqm || 0))} ตร.ม.`
        : "",
      includeDemolition ? `รื้อถอด: ${formatTHB(Math.round(demolitionAreaSqm || 0))} ตร.ม.` : "",
      includeWaste ? `ขนทิ้ง: ${formatTHB(Math.round(wasteAreaSqm || 0))} ตร.ม.` : "",
      "",
      `รวม (ไม่รวม VAT): ${formatTHB(Math.round(totals.totalExVat))} บาท`,
      `ช่วงราคาโดยประมาณ: ${formatTHB(totals.min)} – ${formatTHB(totals.max)} บาท`,
      "",
      "รบกวนติดต่อกลับเพื่อประเมินละเอียด/นัดสำรวจหน้างาน",
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `/?prefill=${encodeURIComponent(message)}#contact`;
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
                  <button type="button" onClick={handleContact} className="btn-blue px-6 py-3 text-base whitespace-nowrap">
                    ส่งให้ทีมประเมิน
                  </button>
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

                <div className="mt-6 grid md:grid-cols-3 gap-4">
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
                    <div className="text-xs text-[#656d76]">รวม (ไม่รวม VAT)</div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">
                      {formatTHB(Math.round(totals.totalExVat))}
                    </div>
                    <div className="text-xs text-[#656d76] mt-1">
                      รวมค่าดำเนินงาน {estimateV2Config.overheadRate * 100}% + เผื่อช่วง {estimateV2Config.bufferRate * 100}%
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-[#f6f8fa] border border-[#d0d7de] rounded-xl p-5">
                  <div className="text-[#656d76] text-sm font-semibold uppercase tracking-wider">ช่วงราคาโดยประมาณ</div>
                  <div className="text-2xl md:text-3xl font-bold text-[#1f2328] mt-1">
                    {formatTHB(totals.min)} – {formatTHB(totals.max)} บาท
                  </div>
                  <div className="text-[#656d76] text-sm mt-2">
                    ราคานี้ไม่รวม VAT และคิดค่าดำเนินงาน {estimateV2Config.overheadRate * 100}% พร้อมเผื่อช่วง {estimateV2Config.bufferRate * 100}%
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

      <Footer />
    </div>
  );
}
