export type ObecPriceType = "material" | "labor";

export type ObecTag =
  | "foundation"
  | "structure"
  | "wall"
  | "roof"
  | "paint"
  | "electrical"
  | "plumbing"
  | "general";

export type ObecPriceItem = {
  id: string;
  type: ObecPriceType;
  category: string;
  name: string;
  unit: string;
  price: number;
  tags: ObecTag[];
  note?: string;
};

export const obec2569Source = {
  articleUrl: "https://www.yotathai.com/yotanews/designobec-2569",
  pdfUrl: "https://drive.google.com/file/d/1JxeReT0vX6JuczM0E--XWYqiImVmEk06/view?usp=sharing",
};

export const obec2569Items: ObecPriceItem[] = [
  {
    id: "mat-cement-50kg",
    type: "material",
    category: "วัสดุโครงสร้าง",
    name: "ปูนซีเมนต์ปอร์ตแลนด์ (ถุง 50 กก.)",
    unit: "ถุง",
    price: 150,
    tags: ["foundation", "structure"],
  },
  {
    id: "mat-rebar-12mm",
    type: "material",
    category: "วัสดุโครงสร้าง",
    name: "เหล็กเส้นกลม/ข้ออ้อย 12 มม.",
    unit: "กก.",
    price: 25,
    tags: ["foundation", "structure"],
  },
  {
    id: "mat-sand",
    type: "material",
    category: "วัสดุก่อ-ฉาบ",
    name: "ทรายหยาบ",
    unit: "คิว",
    price: 450,
    tags: ["foundation", "wall", "general"],
  },
  {
    id: "mat-brick",
    type: "material",
    category: "งานผนัง",
    name: "อิฐมวลเบา (7.5 ซม.)",
    unit: "ก้อน",
    price: 18,
    tags: ["wall"],
  },
  {
    id: "mat-paint",
    type: "material",
    category: "งานสี",
    name: "สีทาภายใน เกรดมาตรฐาน",
    unit: "ลิตร",
    price: 110,
    tags: ["paint"],
  },
  {
    id: "mat-metal-sheet",
    type: "material",
    category: "งานหลังคา",
    name: "เมทัลชีท (รวมอุปกรณ์ยึดติด)",
    unit: "ตร.ม.",
    price: 320,
    tags: ["roof"],
  },
  {
    id: "mat-wire-2p5",
    type: "material",
    category: "งานไฟฟ้า",
    name: "สายไฟ THW 2.5 sqmm",
    unit: "ม.",
    price: 18,
    tags: ["electrical"],
  },
  {
    id: "mat-pvc-1",
    type: "material",
    category: "งานสุขาภิบาล",
    name: "ท่อ PVC 1 นิ้ว (ท่อน)",
    unit: "ท่อน",
    price: 120,
    tags: ["plumbing"],
  },
  {
    id: "lab-mason",
    type: "labor",
    category: "ค่าแรง",
    name: "ค่าแรงก่ออิฐ/ฉาบ (ช่าง+ผู้ช่วย)",
    unit: "ตร.ม.",
    price: 280,
    tags: ["wall"],
  },
  {
    id: "lab-roof",
    type: "labor",
    category: "ค่าแรง",
    name: "ค่าแรงติดตั้งหลังคาเมทัลชีท",
    unit: "ตร.ม.",
    price: 250,
    tags: ["roof"],
  },
  {
    id: "lab-paint",
    type: "labor",
    category: "ค่าแรง",
    name: "ค่าแรงทาสี",
    unit: "ตร.ม.",
    price: 85,
    tags: ["paint"],
  },
  {
    id: "lab-electric",
    type: "labor",
    category: "ค่าแรง",
    name: "ค่าแรงเดินระบบไฟฟ้า (ตามจุด)",
    unit: "จุด",
    price: 320,
    tags: ["electrical"],
  },
];

