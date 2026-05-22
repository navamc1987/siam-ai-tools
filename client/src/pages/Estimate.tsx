import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { estimateV2Config, getLaborPerUnit, type BuildingType, type WorkDifficulty, type WorkType } from "@/data/estimateV2";
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
    const materialSubtotal =
      calculator === "construction" ? constructionData?.totals.materialSubtotal ?? 0 : 0;

    const workType = constructionLaborWorkType[constructionType] ?? "ceiling";
    const laborPerSqm = getLaborPerUnit(workType, workDifficulty);
    const laborSubtotal = Math.max(0, areaSqm || 0) * laborPerSqm;

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
      laborWorkType: workType,
    };
  }, [
    calculator,
    constructionData,
    constructionType,
    workDifficulty,
    buildingType,
    areaSqm,
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
      `พื้นที่: ${formatTHB(Math.round(areaSqm || 0))} ตร.ม.`,
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
                    <label className="text-[#1f2328] text-sm font-bold">จำนวนพื้นที่ก่อสร้าง (ตารางเมตร)</label>
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
                  {calculator !== "construction" && (
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
                      {calculator === "construction" ? `${constructionData?.rows?.length ?? 0} รายการ` : "0 รายการ"}
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
                                <div className="text-[#0969da] font-semibold">
                                  {row.url ? (
                                    <a href={row.url} target="_blank" rel="noreferrer" className="hover:underline">
                                      {row.name ?? row.key}
                                    </a>
                                  ) : (
                                    row.name ?? row.key
                                  )}
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

                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="text-xs text-[#656d76]">ค่าวัสดุ (จาก OneStockHome)</div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">
                      {formatTHB(Math.round(totals.materialSubtotal))}
                    </div>
                  </div>
                  <div className="border border-[#d0d7de] rounded-xl p-4">
                    <div className="text-xs text-[#656d76]">
                      ค่าแรง (fix) {totals.laborWorkType === "wall" ? "งานผนัง" : "งานฝ้า/เพดาน"}
                    </div>
                    <div className="text-[#1f2328] font-bold text-lg mt-1">
                      {formatTHB(Math.round(totals.laborSubtotal))}
                    </div>
                    <div className="text-xs text-[#656d76] mt-1">
                      {formatTHB(Math.round(totals.laborPerSqm))} บาท/ตร.ม.
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

