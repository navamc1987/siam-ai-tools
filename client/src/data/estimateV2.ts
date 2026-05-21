export type BuildingType = "บ้านเดี่ยว/ทาวน์โฮม" | "อาคารพาณิชย์" | "อพาร์ตเมนท์/หอพัก" | "โรงงาน/คลังสินค้า";

export type MaterialUnit = "sqm";

export type MaterialPreset = {
  id: string;
  title: string;
  unit: MaterialUnit;
  unitPriceExVat: number;
  sourceUrl: string;
};

export type WorkItem = {
  id: string;
  title: string;
  qtySqm: number;
  materialPresetId: string;
  laborPerSqm: number;
};

export type EstimateV2Input = {
  buildingType: BuildingType;
  items: WorkItem[];
};

export type EstimateV2Line =
  | { kind: "item"; title: string; qtySqm: number; materialPerSqm: number; laborPerSqm: number; value: number; sourceUrl: string }
  | { kind: "overhead"; title: string; rate: number; value: number }
  | { kind: "buildingMultiplier"; title: string; value: number };

export const estimateV2Config = {
  overheadRate: 0.15,
  bufferRate: 0.1,
  buildingTypeMultiplier: {
    "บ้านเดี่ยว/ทาวน์โฮม": 1,
    "อาคารพาณิชย์": 1.08,
    "อพาร์ตเมนท์/หอพัก": 1.12,
    "โรงงาน/คลังสินค้า": 1.03,
  } satisfies Record<BuildingType, number>,
};

export const materialPresets: MaterialPreset[] = [
  {
    id: "roof-metal-sheet-035-aluzinc",
    title: "เมทัลชีท 0.35 มม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 99.98 / 0.76,
    sourceUrl:
      "https://www.onestockhome.com/th/products/88794114/metal-sheet-imported-760-035-mm-aluzinc-az70_metal-sheet-aluzinc?item_id=68156315",
  },
  {
    id: "system-plumbing-basic",
    title: "งานประปา/ห้องน้ำ (งบวัสดุเฉลี่ย/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 850,
    sourceUrl: "https://www.onestockhome.com/th/departments/plumbing-bathroom",
  },
  {
    id: "system-electrical-basic",
    title: "งานไฟฟ้า/แสงสว่าง (งบวัสดุเฉลี่ย/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 650,
    sourceUrl: "https://www.onestockhome.com/th/departments/electrical-lighting-air-system",
  },
  {
    id: "wall-qcon-brick-10cm",
    title: "อิฐมวลเบา Q-CON 10 ซม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 29.7 * 8.33,
    sourceUrl:
      "https://www.onestockhome.com/th/products/44313027/q-con-light-weight-brick-g2-20x60x10-cm_light-weight-brick_q-con?item_id=19939112",
  },
  {
    id: "wall-cement-board-8mm-120x240",
    title: "สมาร์ทบอร์ด SCG 8 มม. 120x240 (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 292.96 / (1.2 * 2.4),
    sourceUrl:
      "https://www.onestockhome.com/th/items/52291225/smart-board-scg-squared-edge-120x240x08-cm_walls_scg-smartboard_scg",
  },
  {
    id: "ceiling-viva-board-8mm-120x240",
    title: "วีว่าบอร์ด 8 มม. 120x240 (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 372.24 / (1.2 * 2.4),
    sourceUrl: "https://www.onestockhome.com/th/items/30844716/viva-board-120x240cm-8mm_walls_viva-board",
  },
];

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function getMaterialPreset(presetId: string) {
  return materialPresets.find((p) => p.id === presetId);
}

export function calculateEstimateV2(input: EstimateV2Input) {
  const buildingMultiplier = estimateV2Config.buildingTypeMultiplier[input.buildingType];
  const lines: EstimateV2Line[] = [{ kind: "buildingMultiplier", title: "ตัวคูณประเภทอาคาร", value: buildingMultiplier }];

  const itemTotals = input.items
    .filter((it) => it.qtySqm > 0)
    .map((it) => {
      const preset = getMaterialPreset(it.materialPresetId);
      const materialPerSqm = preset?.unitPriceExVat ?? 0;
      const laborPerSqm = Math.max(0, it.laborPerSqm || 0);
      const base = it.qtySqm * (materialPerSqm + laborPerSqm);
      const value = base * buildingMultiplier;
      lines.push({
        kind: "item",
        title: it.title,
        qtySqm: it.qtySqm,
        materialPerSqm,
        laborPerSqm,
        value,
        sourceUrl: preset?.sourceUrl ?? "",
      });
      return value;
    });

  const subtotal = itemTotals.reduce((a, b) => a + b, 0);
  const overhead = subtotal * estimateV2Config.overheadRate;
  lines.push({ kind: "overhead", title: "ค่าดำเนินงาน", rate: estimateV2Config.overheadRate, value: overhead });

  const totalExVat = subtotal + overhead;

  const min = roundTo(totalExVat * (1 - estimateV2Config.bufferRate), 500);
  const max = roundTo(totalExVat * (1 + estimateV2Config.bufferRate), 500);

  return {
    min,
    max,
    totalExVat,
    subtotal,
    overhead,
    lines,
  };
}
