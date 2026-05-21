export type ProjectType =
  | "ต่อเติม/รีโนเวท"
  | "โรงจอดรถ/หลังคา"
  | "ห้องน้ำ"
  | "ห้องครัว"
  | "งานระบบไฟฟ้า"
  | "อื่น ๆ";

export type FinishLevel = "ประหยัด" | "มาตรฐาน" | "พรีเมียม";

export type LocationZone = "กรุงเทพฯ/ปริมณฑล" | "ชลบุรี/ระยอง" | "นครสวรรค์" | "อื่น ๆ";

export type Urgency = "ปกติ" | "เร่งด่วน";

export interface EstimateInput {
  projectType: ProjectType;
  areaSqm: number;
  floors: number;
  finishLevel: FinishLevel;
  locationZone: LocationZone;
  complexity: 1 | 2 | 3 | 4 | 5;
  urgency: Urgency;
  includeElectrical: boolean;
  includePlumbing: boolean;
  includeCeiling: boolean;
}

export type EstimateLine = {
  label: string;
  value: number;
  kind: "base" | "multiplier" | "addon";
};

export const estimateConfig = {
  baseRatePerSqm: {
    "ต่อเติม/รีโนเวท": { min: 6500, max: 13000 },
    "โรงจอดรถ/หลังคา": { min: 4500, max: 9000 },
    "ห้องน้ำ": { min: 12000, max: 25000 },
    "ห้องครัว": { min: 11000, max: 22000 },
    "งานระบบไฟฟ้า": { min: 900, max: 2500 },
    "อื่น ๆ": { min: 5000, max: 12000 },
  } satisfies Record<ProjectType, { min: number; max: number }>,
  finishMultiplier: {
    ประหยัด: 0.9,
    มาตรฐาน: 1,
    พรีเมียม: 1.25,
  } satisfies Record<FinishLevel, number>,
  locationMultiplier: {
    "กรุงเทพฯ/ปริมณฑล": 1,
    "ชลบุรี/ระยอง": 1.03,
    นครสวรรค์: 1.05,
    "อื่น ๆ": 1.08,
  } satisfies Record<LocationZone, number>,
  urgencyMultiplier: {
    ปกติ: 1,
    เร่งด่วน: 1.12,
  } satisfies Record<Urgency, number>,
  complexityMultiplier: {
    1: 0.92,
    2: 0.97,
    3: 1,
    4: 1.08,
    5: 1.18,
  } satisfies Record<EstimateInput["complexity"], number>,
  floorsMultiplier: (floors: number) => {
    if (floors <= 1) return 1;
    if (floors === 2) return 1.06;
    if (floors === 3) return 1.12;
    return 1.16;
  },
  addons: {
    electricalPerSqm: 350,
    plumbingPerSqm: 300,
    ceilingPerSqm: 220,
  },
  buffer: 0.1,
};

function roundToNearest(value: number, step: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / step) * step;
}

export function calculateEstimate(input: EstimateInput) {
  const area = Math.max(0, input.areaSqm);
  const baseRate = estimateConfig.baseRatePerSqm[input.projectType];

  const baseMin = area * baseRate.min;
  const baseMax = area * baseRate.max;

  const multipliers: EstimateLine[] = [
    { label: `ระดับงาน: ${input.finishLevel}`, value: estimateConfig.finishMultiplier[input.finishLevel], kind: "multiplier" },
    { label: `พื้นที่: ${input.locationZone}`, value: estimateConfig.locationMultiplier[input.locationZone], kind: "multiplier" },
    { label: `ความซับซ้อน: ${input.complexity}/5`, value: estimateConfig.complexityMultiplier[input.complexity], kind: "multiplier" },
    { label: `จำนวนชั้น: ${input.floors}`, value: estimateConfig.floorsMultiplier(input.floors), kind: "multiplier" },
    { label: `ความเร่งด่วน: ${input.urgency}`, value: estimateConfig.urgencyMultiplier[input.urgency], kind: "multiplier" },
  ];

  const addons: EstimateLine[] = [
    ...(input.includeElectrical ? [{ label: "รวมงานไฟฟ้าเพิ่มเติม", value: area * estimateConfig.addons.electricalPerSqm, kind: "addon" as const }] : []),
    ...(input.includePlumbing ? [{ label: "รวมงานประปาเพิ่มเติม", value: area * estimateConfig.addons.plumbingPerSqm, kind: "addon" as const }] : []),
    ...(input.includeCeiling ? [{ label: "รวมงานฝ้า/เพดานเพิ่มเติม", value: area * estimateConfig.addons.ceilingPerSqm, kind: "addon" as const }] : []),
  ];

  const multiplierValue = multipliers.reduce((acc, m) => acc * m.value, 1);
  const addonValue = addons.reduce((acc, a) => acc + a.value, 0);

  const preBufferMin = baseMin * multiplierValue + addonValue;
  const preBufferMax = baseMax * multiplierValue + addonValue;

  const min = roundToNearest(preBufferMin * (1 - estimateConfig.buffer), 500);
  const max = roundToNearest(preBufferMax * (1 + estimateConfig.buffer), 500);

  return {
    min,
    max,
    lines: [
      { label: `ฐานราคา/ตร.ม. (${input.projectType})`, value: baseRate.min, kind: "base" as const },
      ...multipliers,
      ...addons,
    ],
  };
}

