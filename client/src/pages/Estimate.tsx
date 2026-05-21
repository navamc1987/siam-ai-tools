import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { calculateEstimateV2, estimateV2Config, getLaborPerSqm, materialPresets, type BuildingType, type WorkDifficulty, type WorkItem } from "@/data/estimateV2";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

const buildingTypes: BuildingType[] = ["บ้านเดี่ยว/ทาวน์โฮม", "อาคารพาณิชย์", "อพาร์ตเมนท์/หอพัก", "โรงงาน/คลังสินค้า"];
const workDifficulties: WorkDifficulty[] = ["สะดวก", "ปกติ", "ยาก", "ยากมาก"];

function getPresetOptions(prefix: string) {
  return materialPresets.filter((p) => p.id.startsWith(prefix));
}

type FormValues = {
  buildingType: BuildingType;
  workDifficulty: WorkDifficulty;

  includeRoof: boolean;
  roofAreaSqm: number;
  roofMaterialPresetId: string;

  includeWall: boolean;
  wallAreaSqm: number;
  wallMaterialPresetId: string;

  includeCeiling: boolean;
  ceilingAreaSqm: number;
  ceilingMaterialPresetId: string;

  includePaint: boolean;
  paintAreaSqm: number;
  paintMaterialPresetId: string;

  includePlumbing: boolean;
  plumbingAreaSqm: number;
  plumbingMaterialPresetId: string;

  includeElectricalWiring: boolean;
  electricalWiringAreaSqm: number;
  electricalWiringMaterialPresetId: string;

  includeElectricalDevices: boolean;
  electricalDevicesAreaSqm: number;
  electricalDevicesMaterialPresetId: string;

  includeLighting: boolean;
  lightingAreaSqm: number;
  lightingMaterialPresetId: string;

  includeDemolition: boolean;
  demolitionAreaSqm: number;

  includeWaste: boolean;
  wasteAreaSqm: number;
};

function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export default function Estimate() {
  const form = useForm<FormValues>({
    defaultValues: {
      buildingType: "บ้านเดี่ยว/ทาวน์โฮม",
      workDifficulty: "ปกติ",

      includeRoof: true,
      roofAreaSqm: 40,
      roofMaterialPresetId: getPresetOptions("roof-")[0]?.id ?? "",

      includeWall: true,
      wallAreaSqm: 60,
      wallMaterialPresetId: getPresetOptions("wall-")[0]?.id ?? "",

      includeCeiling: true,
      ceilingAreaSqm: 30,
      ceilingMaterialPresetId: getPresetOptions("ceiling-")[0]?.id ?? "",

      includePaint: false,
      paintAreaSqm: 60,
      paintMaterialPresetId: getPresetOptions("paint-")[0]?.id ?? "paint-interior-basic",

      includePlumbing: true,
      plumbingAreaSqm: 8,
      plumbingMaterialPresetId: getPresetOptions("system-plumbing-")[0]?.id ?? "system-plumbing-basic",

      includeElectricalWiring: true,
      electricalWiringAreaSqm: 30,
      electricalWiringMaterialPresetId: getPresetOptions("system-electrical-wiring")[0]?.id ?? "system-electrical-wiring",

      includeElectricalDevices: true,
      electricalDevicesAreaSqm: 30,
      electricalDevicesMaterialPresetId: getPresetOptions("system-electrical-devices")[0]?.id ?? "system-electrical-devices",

      includeLighting: true,
      lightingAreaSqm: 30,
      lightingMaterialPresetId: getPresetOptions("system-lighting-")[0]?.id ?? "system-lighting-basic",

      includeDemolition: false,
      demolitionAreaSqm: 20,

      includeWaste: false,
      wasteAreaSqm: 20,
    },
    mode: "onChange",
  });

  const values = form.watch();

  const estimate = useMemo(() => {
    const items: WorkItem[] = [];

    if (values.includeRoof) {
      items.push({
        id: "roof",
        title: "หลังคา",
        workType: "roof",
        qtySqm: Number(values.roofAreaSqm) || 0,
        materialPresetId: values.roofMaterialPresetId,
      });
    }

    if (values.includeWall) {
      items.push({
        id: "wall",
        title: "ผนัง",
        workType: "wall",
        qtySqm: Number(values.wallAreaSqm) || 0,
        materialPresetId: values.wallMaterialPresetId,
      });
    }

    if (values.includeCeiling) {
      items.push({
        id: "ceiling",
        title: "ฝ้า/เพดาน",
        workType: "ceiling",
        qtySqm: Number(values.ceilingAreaSqm) || 0,
        materialPresetId: values.ceilingMaterialPresetId,
      });
    }

    if (values.includePaint) {
      items.push({
        id: "paint",
        title: "งานสี",
        workType: "paint",
        qtySqm: Number(values.paintAreaSqm) || 0,
        materialPresetId: values.paintMaterialPresetId,
      });
    }

    if (values.includePlumbing) {
      items.push({
        id: "plumbing",
        title: "ประปา/ห้องน้ำ",
        workType: "plumbing",
        qtySqm: Number(values.plumbingAreaSqm) || 0,
        materialPresetId: values.plumbingMaterialPresetId,
      });
    }

    if (values.includeElectricalWiring) {
      items.push({
        id: "electrical-wiring",
        title: "ไฟฟ้า: เดินท่อ/เดินสาย",
        workType: "electrical-wiring",
        qtySqm: Number(values.electricalWiringAreaSqm) || 0,
        materialPresetId: values.electricalWiringMaterialPresetId,
      });
    }

    if (values.includeElectricalDevices) {
      items.push({
        id: "electrical-devices",
        title: "ไฟฟ้า: สวิตช์/ปลั๊ก/เบรกเกอร์ย่อย",
        workType: "electrical-devices",
        qtySqm: Number(values.electricalDevicesAreaSqm) || 0,
        materialPresetId: values.electricalDevicesMaterialPresetId,
      });
    }

    if (values.includeLighting) {
      items.push({
        id: "lighting",
        title: "แสงสว่าง: โคม/หลอด/อุปกรณ์",
        workType: "lighting",
        qtySqm: Number(values.lightingAreaSqm) || 0,
        materialPresetId: values.lightingMaterialPresetId,
      });
    }

    if (values.includeDemolition) {
      items.push({
        id: "demolition",
        title: "รื้อถอด",
        workType: "demolition",
        qtySqm: Number(values.demolitionAreaSqm) || 0,
        materialPresetId: "none",
      });
    }

    if (values.includeWaste) {
      items.push({
        id: "waste",
        title: "ขนทิ้ง",
        workType: "waste",
        qtySqm: Number(values.wasteAreaSqm) || 0,
        materialPresetId: "none",
      });
    }

    return calculateEstimateV2({ buildingType: values.buildingType, workDifficulty: values.workDifficulty, items });
  }, [values]);

  const handleContact = async () => {
    const selectedItems = estimate.lines.filter((l) => l.kind === "item");
    const message = [
      "ขอประเมินราคาเบื้องต้น",
      `ประเภทอาคาร: ${values.buildingType}`,
      `ความสะดวกในการทำงาน: ${values.workDifficulty}`,
      "",
      "รายการงาน (ตร.ม.):",
      ...selectedItems.map((l) => `- ${l.title}: ${l.qtySqm} ตร.ม.`),
      "",
      `รวม (ไม่รวม VAT): ${formatTHB(Math.round(estimate.totalExVat))} บาท`,
      `ช่วงราคาโดยประมาณ: ${formatTHB(estimate.min)} – ${formatTHB(estimate.max)} บาท`,
      `ค่าดำเนินงาน: ${estimateV2Config.overheadRate * 100}%`,
      "",
      "รบกวนติดต่อกลับเพื่อประเมินละเอียด/นัดสำรวจหน้างาน",
    ].join("\n");

    const url = `/?prefill=${encodeURIComponent(message)}#contact`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Navbar />

      <section className="pt-24 pb-12 bg-white border-b border-[#d0d7de]">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1f2328] mb-4">ประเมินราคาเบื้องต้น</h1>
            <p className="text-[#656d76] text-lg">
              เลือกประเภทอาคาร + ใส่ปริมาณงานเป็น “ตร.ม.” แยกตามหมวด และเลือกวัสดุอ้างอิงราคา (ไม่รวม VAT) เพื่อให้ได้ราคาที่ละเอียดขึ้น
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container grid lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white border border-[#d0d7de] rounded-xl p-6 md:p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-2">
                <label className="text-[#1f2328] text-sm font-bold">ประเภทอาคาร</label>
                <select
                  className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                  {...form.register("buildingType")}
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
                  className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                  {...form.register("workDifficulty")}
                >
                  {workDifficulties.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className="text-[#656d76] text-xs">
                  ใช้กรณีพื้นที่สูง/นั่งร้าน/งาน safety/ต้องขนของขึ้น/ใช้โฟลกลิฟต์-กรรไกรยก (x-lift) ฯลฯ
                </p>
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">หลังคา</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeRoof")} />
                    รวม
                  </label>
                </div>
                {values.includeRoof && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("roofAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("roofMaterialPresetId")}
                      >
                        {getPresetOptions("roof-").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includeRoof && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("roof", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">ผนัง</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeWall")} />
                    รวม
                  </label>
                </div>
                {values.includeWall && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("wallAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("wallMaterialPresetId")}
                      >
                        {getPresetOptions("wall-").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includeWall && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("wall", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">ฝ้า/เพดาน</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeCeiling")} />
                    รวม
                  </label>
                </div>
                {values.includeCeiling && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("ceilingAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("ceilingMaterialPresetId")}
                      >
                        {getPresetOptions("ceiling-").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includeCeiling && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("ceiling", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">งานสี</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includePaint")} />
                    รวม
                  </label>
                </div>
                {values.includePaint && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("paintAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("paintMaterialPresetId")}
                      >
                        {getPresetOptions("paint-").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includePaint && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("paint", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">ประปา/ห้องน้ำ</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includePlumbing")} />
                    รวม
                  </label>
                </div>
                {values.includePlumbing && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("plumbingAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("plumbingMaterialPresetId")}
                      >
                        {getPresetOptions("system-plumbing-").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includePlumbing && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("plumbing", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">ไฟฟ้า: เดินท่อ/เดินสาย</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeElectricalWiring")} />
                    รวม
                  </label>
                </div>
                {values.includeElectricalWiring && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("electricalWiringAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("electricalWiringMaterialPresetId")}
                      >
                        {getPresetOptions("system-electrical-wiring").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includeElectricalWiring && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("electrical-wiring", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">ไฟฟ้า: สวิตช์/ปลั๊ก/เบรกเกอร์ย่อย</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeElectricalDevices")} />
                    รวม
                  </label>
                </div>
                {values.includeElectricalDevices && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("electricalDevicesAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("electricalDevicesMaterialPresetId")}
                      >
                        {getPresetOptions("system-electrical-devices").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includeElectricalDevices && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("electrical-devices", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">แสงสว่าง: โคม/หลอด/อุปกรณ์</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeLighting")} />
                    รวม
                  </label>
                </div>
                {values.includeLighting && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("lightingAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">วัสดุอ้างอิงราคา</label>
                      <select
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("lightingMaterialPresetId")}
                      >
                        {getPresetOptions("system-lighting-").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {values.includeLighting && (
                  <div className="text-xs text-[#656d76]">
                    ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("lighting", values.workDifficulty)))} บาท/ตร.ม.
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">งานรื้อถอด</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeDemolition")} />
                    รวม
                  </label>
                </div>
                {values.includeDemolition && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("demolitionAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="text-xs text-[#656d76] flex items-end">
                      ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("demolition", values.workDifficulty)))} บาท/ตร.ม.
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#d0d7de] pt-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#1f2328] text-sm font-bold">งานขนทิ้ง</p>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328]">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeWaste")} />
                    รวม
                  </label>
                </div>
                {values.includeWaste && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                        {...form.register("wasteAreaSqm", { valueAsNumber: true, min: 0 })}
                      />
                    </div>
                    <div className="text-xs text-[#656d76] flex items-end">
                      ค่าแรง (fix): {formatTHB(Math.round(getLaborPerSqm("waste", values.workDifficulty)))} บาท/ตร.ม.
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#d0d7de] rounded-xl p-6 md:p-8">
              <p className="text-[#656d76] text-sm font-semibold uppercase tracking-wider">ช่วงราคาโดยประมาณ</p>
              <div className="mt-2">
                <p className="text-3xl md:text-4xl font-bold text-[#1f2328]">
                  {formatTHB(estimate.min)} – {formatTHB(estimate.max)} บาท
                </p>
                <p className="text-[#656d76] text-sm mt-2">
                  ราคานี้ไม่รวม VAT และคิดค่าดำเนินงาน {estimateV2Config.overheadRate * 100}% พร้อมเผื่อช่วง {estimateV2Config.bufferRate * 100}% เพื่อความสมจริง
                </p>
              </div>

              <div className="mt-6 grid gap-2">
                <button onClick={handleContact} className="btn-blue w-full py-3 text-base">
                  ส่งรายละเอียดให้ทีมประเมินต่อ
                </button>
                <a href="/portfolio?category=ต่อเติมและรีโนเวท" className="btn-secondary w-full py-3 text-base text-center">
                  ดูผลงานประกอบการตัดสินใจ
                </a>
              </div>
            </div>

            <div className="bg-white border border-[#d0d7de] rounded-xl p-6 md:p-8">
              <h3 className="text-[#1f2328] font-bold text-lg mb-4">ใช้สูตรอะไรในการคิด</h3>
              <div className="space-y-3 text-sm text-[#656d76]">
                {estimate.lines.map((l) => {
                  if (l.kind === "buildingMultiplier") {
                    return (
                      <div key={l.title} className="flex items-center justify-between gap-6">
                        <span>{l.title}</span>
                        <span className="font-semibold text-[#1f2328]">× {l.value.toFixed(2)}</span>
                      </div>
                    );
                  }
                  if (l.kind === "overhead") {
                    return (
                      <div key={l.title} className="flex items-center justify-between gap-6">
                        <span>
                          {l.title} ({l.rate * 100}%)
                        </span>
                        <span className="font-semibold text-[#1f2328]">+ {formatTHB(Math.round(l.value))}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={l.title} className="flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        <div className="text-[#1f2328] font-semibold">{l.title}</div>
                        <div className="text-xs">
                          {l.qtySqm} ตร.ม. × ({formatTHB(Math.round(l.materialPerSqm))} วัสดุ + {formatTHB(Math.round(l.laborPerSqm))} แรงงาน)
                        </div>
                        {l.sourceUrl && (
                          <a href={l.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-[#0969da] hover:underline">
                            อ้างอิงราคา
                          </a>
                        )}
                      </div>
                      <span className="font-semibold text-[#1f2328]">{formatTHB(Math.round(l.value))}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 text-xs text-[#656d76]">
                * เป็นการประเมินเบื้องต้นเท่านั้น ราคาจริงขึ้นกับสภาพหน้างาน วัสดุ โครงสร้างเดิม และเงื่อนไขการทำงาน
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

