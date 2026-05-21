import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { calculateEstimate, type EstimateInput, estimateConfig, type FinishLevel, type LocationZone, type ProjectType, type Urgency } from "@/data/estimate";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

const projectTypes: ProjectType[] = ["ต่อเติม/รีโนเวท", "โรงจอดรถ/หลังคา", "ห้องน้ำ", "ห้องครัว", "งานระบบไฟฟ้า", "อื่น ๆ"];
const finishLevels: FinishLevel[] = ["ประหยัด", "มาตรฐาน", "พรีเมียม"];
const locationZones: LocationZone[] = ["กรุงเทพฯ/ปริมณฑล", "ชลบุรี/ระยอง", "นครสวรรค์", "อื่น ๆ"];
const urgencies: Urgency[] = ["ปกติ", "เร่งด่วน"];

type FormValues = {
  projectType: ProjectType;
  areaSqm: number;
  floors: number;
  finishLevel: FinishLevel;
  locationZone: LocationZone;
  complexity: number;
  urgency: Urgency;
  includeElectrical: boolean;
  includePlumbing: boolean;
  includeCeiling: boolean;
};

function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export default function Estimate() {
  const form = useForm<FormValues>({
    defaultValues: {
      projectType: "ต่อเติม/รีโนเวท",
      areaSqm: 30,
      floors: 1,
      finishLevel: "มาตรฐาน",
      locationZone: "กรุงเทพฯ/ปริมณฑล",
      complexity: 3,
      urgency: "ปกติ",
      includeElectrical: true,
      includePlumbing: false,
      includeCeiling: false,
    },
    mode: "onChange",
  });

  const values = form.watch();

  const estimate = useMemo(() => {
    const input: EstimateInput = {
      projectType: values.projectType,
      areaSqm: Number(values.areaSqm) || 0,
      floors: Number(values.floors) || 1,
      finishLevel: values.finishLevel,
      locationZone: values.locationZone,
      complexity: (Number(values.complexity) || 3) as EstimateInput["complexity"],
      urgency: values.urgency,
      includeElectrical: values.includeElectrical,
      includePlumbing: values.includePlumbing,
      includeCeiling: values.includeCeiling,
    };

    return calculateEstimate(input);
  }, [values]);

  const handleContact = async () => {
    const message = [
      "ขอประเมินราคาเบื้องต้น",
      `ประเภทงาน: ${values.projectType}`,
      `พื้นที่: ${values.areaSqm} ตร.ม. | จำนวนชั้น: ${values.floors}`,
      `ระดับงาน: ${values.finishLevel} | ความซับซ้อน: ${values.complexity}/5 | ความเร่งด่วน: ${values.urgency}`,
      `พื้นที่ให้บริการ: ${values.locationZone}`,
      `ตัวเลือกเพิ่มเติม:`,
      `- งานไฟฟ้า: ${values.includeElectrical ? "รวม" : "ไม่รวม"}`,
      `- งานประปา: ${values.includePlumbing ? "รวม" : "ไม่รวม"}`,
      `- งานฝ้า/เพดาน: ${values.includeCeiling ? "รวม" : "ไม่รวม"}`,
      `ช่วงราคาโดยประมาณ: ${formatTHB(estimate.min)} – ${formatTHB(estimate.max)} บาท`,
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
              กรอกข้อมูลหลัก ๆ เพื่อได้ช่วงราคา “คร่าว ๆ” ก่อนนัดดูหน้างานจริง ช่วยลดเวลาและคัดกรองงบประมาณได้ไวขึ้น
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container grid lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white border border-[#d0d7de] rounded-xl p-6 md:p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-2">
                <label className="text-[#1f2328] text-sm font-bold">ประเภทงาน</label>
                <select
                  className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                  {...form.register("projectType")}
                >
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">พื้นที่ (ตร.ม.)</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    {...form.register("areaSqm", {
                      valueAsNumber: true,
                      min: { value: 1, message: "กรุณากรอกพื้นที่ (ตร.ม.)" },
                    })}
                  />
                  {form.formState.errors.areaSqm?.message && (
                    <p className="text-red-600 text-xs font-semibold">{form.formState.errors.areaSqm?.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">จำนวนชั้น</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    {...form.register("floors", { valueAsNumber: true, min: 1, max: 5 })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">ระดับงาน</label>
                  <select
                    className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    {...form.register("finishLevel")}
                  >
                    {finishLevels.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">พื้นที่ให้บริการ</label>
                  <select
                    className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    {...form.register("locationZone")}
                  >
                    {locationZones.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">ความเร่งด่วน</label>
                  <select
                    className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-4 py-2.5 text-[#1f2328] text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] transition-all"
                    {...form.register("urgency")}
                  >
                    {urgencies.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-[#1f2328] text-sm font-bold">ความซับซ้อน: {values.complexity}/5</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                    {...form.register("complexity", { valueAsNumber: true, min: 1, max: 5 })}
                  />
                  <p className="text-[#656d76] text-xs">
                    1 = งานโล่ง/ทำง่าย, 5 = งานซับซ้อน (งานเดิมเยอะ, เดินระบบหลายจุด, ดีเทลสูง)
                  </p>
                </div>
              </div>

              <div className="border-t border-[#d0d7de] pt-6">
                <p className="text-[#1f2328] text-sm font-bold mb-3">ตัวเลือกเพิ่มเติม</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm text-[#1f2328] bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-2">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeElectrical")} />
                    งานไฟฟ้า
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328] bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-2">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includePlumbing")} />
                    งานประปา
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#1f2328] bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-2">
                    <input type="checkbox" className="accent-[#0969da]" {...form.register("includeCeiling")} />
                    งานฝ้า/เพดาน
                  </label>
                </div>
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
                  ระบบคำนวณจาก “อัตราต่อ ตร.ม.” + ตัวคูณความซับซ้อน/พื้นที่/ระดับงาน และเผื่อช่วง {estimateConfig.buffer * 100}% เพื่อความสมจริง
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
                <div className="flex items-center justify-between gap-6">
                  <span>ฐานราคา/ตร.ม. (ตามประเภทงาน)</span>
                  <span className="font-semibold text-[#1f2328]">{formatTHB(estimate.lines[0]?.value ?? 0)}+</span>
                </div>
                {estimate.lines
                  .filter((l) => l.kind === "multiplier")
                  .map((l) => (
                    <div key={l.label} className="flex items-center justify-between gap-6">
                      <span>{l.label}</span>
                      <span className="font-semibold text-[#1f2328]">× {l.value.toFixed(2)}</span>
                    </div>
                  ))}
                {estimate.lines
                  .filter((l) => l.kind === "addon")
                  .map((l) => (
                    <div key={l.label} className="flex items-center justify-between gap-6">
                      <span>{l.label}</span>
                      <span className="font-semibold text-[#1f2328]">+ {formatTHB(l.value)}</span>
                    </div>
                  ))}
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

