export type BuildingType = "บ้านเดี่ยว/ทาวน์โฮม" | "อาคารพาณิชย์" | "อพาร์ตเมนท์/หอพัก" | "โรงงาน/คลังสินค้า";

export type WorkDifficulty = "สะดวก" | "ปกติ" | "ยาก" | "ยากมาก";

export type WorkType =
  | "roof"
  | "wall"
  | "ceiling"
  | "paint"
  | "concrete"
  | "floor-concrete"
  | "wall-plaster"
  | "plumbing"
  | "electrical-wiring"
  | "electrical-devices"
  | "lighting"
  | "demolition"
  | "waste";

export type MaterialUnit = "sqm" | "m3" | "m" | "point" | "bulb";

export type MaterialPreset = {
  id: string;
  title: string;
  unit: MaterialUnit;
  unitPriceExVat: number;
  sourceUrl: string;
  imageUrl?: string;
};

export type WorkItem = {
  id: string;
  title: string;
  workType: WorkType;
  qty: number;
  unit: MaterialUnit;
  materialPresetId: string;
};

export type EstimateV2Input = {
  buildingType: BuildingType;
  workDifficulty: WorkDifficulty;
  items: WorkItem[];
};

export type EstimateV2Line =
  | {
      kind: "item";
      title: string;
      qty: number;
      unit: MaterialUnit;
      materialPerUnit: number;
      laborPerUnit: number;
      value: number;
      sourceUrl: string;
    }
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
  workDifficultyMultiplier: {
    สะดวก: 1,
    ปกติ: 1.1,
    ยาก: 1.25,
    ยากมาก: 1.45,
  } satisfies Record<WorkDifficulty, number>,
  laborBasePerUnit: {
    roof: 450,
    wall: 350,
    ceiling: 300,
    paint: 160,
    concrete: 420,
    "floor-concrete": 320,
    "wall-plaster": 220,
    plumbing: 900,
    "electrical-wiring": 60,
    "electrical-devices": 180,
    lighting: 120,
    demolition: 280,
    waste: 220,
  } satisfies Record<WorkType, number>,
};

export const materialPresets: MaterialPreset[] = [
  {
    id: "none",
    title: "ไม่คิดค่าวัสดุ (0 บาท/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 0,
    sourceUrl: "",
  },
  {
    id: "floor-concrete-basic",
    title: "งานเทพื้นปูน (งบวัสดุเฉลี่ย/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 650,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/cement",
  },
  {
    id: "wall-plaster-basic",
    title: "งานฉาบผนัง (งบวัสดุเฉลี่ย/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 180,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/cement",
  },
  {
    id: "roof-metal-sheet-035-aluzinc",
    title: "เมทัลชีท 0.35 มม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 99.98 / 0.76,
    sourceUrl:
      "https://www.onestockhome.com/th/products/88794114/metal-sheet-imported-760-035-mm-aluzinc-az70_metal-sheet-aluzinc?item_id=68156315",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20metal%20sheet%20roof%20panel%20stack%20with%20aluzinc%20finish%2C%20construction%20material%2C%20clean%20studio%20lighting%2C%20sharp%20focus%2C%20high%20detail%2C%20commercial%20product%20photo&image_size=square",
  },
  {
    id: "roof-metal-sheet-040-aluzinc",
    title: "เมทัลชีท 0.40 มม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 105.41 / 0.76,
    sourceUrl:
      "https://www.onestockhome.com/th/products/6588808/metal-sheet-imported-760-040-mm-aluzinc-az70_metal-sheet-aluzinc?item_id=11325999",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20metal%20sheet%20roof%20panel%20stack%20with%20aluzinc%20finish%2C%20construction%20material%2C%20clean%20studio%20lighting%2C%20sharp%20focus%2C%20high%20detail%2C%20commercial%20product%20photo&image_size=square",
  },
  {
    id: "roof-metal-sheet-047-aluzinc",
    title: "เมทัลชีท 0.47 มม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 119.54 / 0.76,
    sourceUrl:
      "https://www.onestockhome.com/th/products/94503462/metal-sheet-imported-760-047-mm-aluzinc-az70_metal-sheet-standard-profile?item_id=12146165",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20metal%20sheet%20roof%20panel%20stack%20with%20aluzinc%20finish%2C%20construction%20material%2C%20clean%20studio%20lighting%2C%20sharp%20focus%2C%20high%20detail%2C%20commercial%20product%20photo&image_size=square",
  },
  {
    id: "roof-metal-sheet-050-aluzinc",
    title: "เมทัลชีท 0.50 มม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 177.57 / 0.76,
    sourceUrl:
      "https://www.onestockhome.com/th/products/13764186/metal-sheet-imported-760-05-mm-aluzinc-az70_metal-sheet-standard-profile?item_id=35767066",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20metal%20sheet%20roof%20panel%20stack%20with%20aluzinc%20finish%2C%20construction%20material%2C%20clean%20studio%20lighting%2C%20sharp%20focus%2C%20high%20detail%2C%20commercial%20product%20photo&image_size=square",
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
    id: "system-electrical-wiring",
    title: "ไฟฟ้า: เดินท่อ/เดินสาย (งบวัสดุเฉลี่ย/เมตร)",
    unit: "m",
    unitPriceExVat: 45,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/electrical-system",
  },
  {
    id: "system-electrical-devices",
    title: "ไฟฟ้า: สวิตช์/ปลั๊ก/เบรกเกอร์ย่อย (งบวัสดุเฉลี่ย/จุด)",
    unit: "point",
    unitPriceExVat: 220,
    sourceUrl: "https://www.onestockhome.com/th/departments/electrical-lighting-air-system",
  },
  {
    id: "system-lighting-basic",
    title: "แสงสว่าง: โคม/หลอด/อุปกรณ์ (งบวัสดุเฉลี่ย/หลอด)",
    unit: "bulb",
    unitPriceExVat: 190,
    sourceUrl: "https://www.onestockhome.com/th/departments/electrical-lighting-air-system",
  },
  {
    id: "paint-interior-basic",
    title: "งานสีภายใน (งบวัสดุเฉลี่ย/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 95,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/paints",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20paint%20bucket%20with%20roller%20on%20clean%20white%20background%2C%20studio%20product%20photo%2C%20sharp%20focus%2C%20high%20detail%2C%20soft%20shadow%2C%2035mm%2C%20commercial%20product%20photography&image_size=square",
  },
  {
    id: "paint-exterior-basic",
    title: "งานสีภายนอก (งบวัสดุเฉลี่ย/ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 135,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/paints",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20paint%20bucket%20with%20roller%20on%20clean%20white%20background%2C%20studio%20product%20photo%2C%20sharp%20focus%2C%20high%20detail%2C%20soft%20shadow%2C%2035mm%2C%20commercial%20product%20photography&image_size=square",
  },
  {
    id: "concrete-ready-mix-180",
    title: "คอนกรีตผสมเสร็จ 180 KSC (บาท/คิว)",
    unit: "m3",
    unitPriceExVat: 2150,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/cement",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20ready%20mix%20concrete%20truck%20pouring%20concrete%20into%20a%20formwork%20at%20a%20construction%20site%2C%20daylight%2C%20sharp%20focus%2C%20high%20detail%2C%20professional%20commercial%20photo&image_size=square",
  },
  {
    id: "concrete-ready-mix-210",
    title: "คอนกรีตผสมเสร็จ 210 KSC (บาท/คิว)",
    unit: "m3",
    unitPriceExVat: 2250,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/cement",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20ready%20mix%20concrete%20truck%20pouring%20concrete%20into%20a%20formwork%20at%20a%20construction%20site%2C%20daylight%2C%20sharp%20focus%2C%20high%20detail%2C%20professional%20commercial%20photo&image_size=square",
  },
  {
    id: "concrete-ready-mix-240",
    title: "คอนกรีตผสมเสร็จ 240 KSC (บาท/คิว)",
    unit: "m3",
    unitPriceExVat: 2350,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/cement",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20ready%20mix%20concrete%20truck%20pouring%20concrete%20into%20a%20formwork%20at%20a%20construction%20site%2C%20daylight%2C%20sharp%20focus%2C%20high%20detail%2C%20professional%20commercial%20photo&image_size=square",
  },
  {
    id: "concrete-ready-mix-280",
    title: "คอนกรีตผสมเสร็จ 280 KSC (บาท/คิว)",
    unit: "m3",
    unitPriceExVat: 2550,
    sourceUrl: "https://www.onestockhome.com/th/product_categories/cement",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20ready%20mix%20concrete%20truck%20pouring%20concrete%20into%20a%20formwork%20at%20a%20construction%20site%2C%20daylight%2C%20sharp%20focus%2C%20high%20detail%2C%20professional%20commercial%20photo&image_size=square",
  },
  {
    id: "wall-qcon-brick-10cm",
    title: "อิฐมวลเบา Q-CON 10 ซม. (คำนวณเป็น ตร.ม.)",
    unit: "sqm",
    unitPriceExVat: 29.7 * 8.33,
    sourceUrl:
      "https://www.onestockhome.com/th/products/44313027/q-con-light-weight-brick-g2-20x60x10-cm_light-weight-brick_q-con?item_id=19939112",
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photorealistic%20stack%20of%20lightweight%20aerated%20concrete%20blocks%20on%20a%20pallet%2C%20construction%20materials%2C%20clean%20studio%20lighting%2C%20sharp%20focus%2C%20high%20detail%2C%20commercial%20product%20photo&image_size=square",
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

export function getLaborPerUnit(workType: WorkType, difficulty: WorkDifficulty) {
  const base = estimateV2Config.laborBasePerUnit[workType];
  const multiplier = estimateV2Config.workDifficultyMultiplier[difficulty];
  return base * multiplier;
}

export function calculateEstimateV2(input: EstimateV2Input) {
  const buildingMultiplier = estimateV2Config.buildingTypeMultiplier[input.buildingType];
  const lines: EstimateV2Line[] = [{ kind: "buildingMultiplier", title: "ตัวคูณประเภทอาคาร", value: buildingMultiplier }];

  const itemTotals = input.items
    .filter((it) => it.qty > 0)
    .map((it) => {
      const preset = getMaterialPreset(it.materialPresetId);
      const materialPerUnit = preset?.unitPriceExVat ?? 0;
      const laborPerUnit = getLaborPerUnit(it.workType, input.workDifficulty);
      const base = it.qty * (materialPerUnit + laborPerUnit);
      const value = base * buildingMultiplier;
      lines.push({
        kind: "item",
        title: it.title,
        qty: it.qty,
        unit: it.unit,
        materialPerUnit,
        laborPerUnit,
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
