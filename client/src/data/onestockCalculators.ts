export type OnestockCalculatorId =
  | "construction"
  | "paint"
  | "concrete"
  | "brick"
  | "metal-sheet";

export type OnestockCalculatorCard = {
  id: OnestockCalculatorId;
  title: string;
  description: string;
  gradient: { from: string; to: string };
  imageUrl: string;
  enabled: boolean;
};

function img(prompt: string, imageSize: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${imageSize}`;
}

export const onestockCalculatorCards: OnestockCalculatorCard[] = [
  {
    id: "construction",
    title: "คำนวณโครงคร่าว",
    description: "ฝ้า/ผนังยิปซัม โครงคร่าว และอุปกรณ์",
    gradient: { from: "#ff7a6b", to: "#ff7e60" },
    imageUrl: img(
      "Photorealistic product photo of a yellow and black tape measure on clean studio background, soft shadow, high detail, e-commerce style",
      "landscape_4_3"
    ),
    enabled: true,
  },
  {
    id: "paint",
    title: "คำนวณปริมาณสีที่ใช้",
    description: "สีทาภายใน/ภายนอก และพื้นที่งาน",
    gradient: { from: "#d7ffe3", to: "#fff2a6" },
    imageUrl: img(
      "Photorealistic product photo of a paint tray with yellow paint roller, clean studio background, soft shadow, high detail, e-commerce style",
      "landscape_4_3"
    ),
    enabled: true,
  },
  {
    id: "concrete",
    title: "คำนวณปริมาตรคอนกรีต",
    description: "คอนกรีตผสมเสร็จ/ปูนผสมเสร็จ",
    gradient: { from: "#d7fff2", to: "#cfe7ff" },
    imageUrl: img(
      "Photorealistic product photo of a white cement mixer truck in studio lighting, clean background, soft shadow, high detail",
      "landscape_4_3"
    ),
    enabled: false,
  },
  {
    id: "brick",
    title: "คำนวณอิฐก่อผนัง",
    description: "อิฐมวลเบา/อิฐแดง และปูนก่อ",
    gradient: { from: "#fff7c7", to: "#fff0b0" },
    imageUrl: img(
      "Photorealistic product photo of an orange clay brick and a masonry trowel on clean studio background, soft shadow, high detail",
      "landscape_4_3"
    ),
    enabled: false,
  },
  {
    id: "metal-sheet",
    title: "คำนวณเมทัลชีท",
    description: "เมทัลชีททุกประเภท ตามการใช้งาน",
    gradient: { from: "#5b6473", to: "#7b8796" },
    imageUrl: img(
      "Photorealistic close-up product photo of stacked metal roofing sheets, studio lighting, clean background, soft shadow, high detail",
      "landscape_4_3"
    ),
    enabled: false,
  },
];
