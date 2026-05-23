export type KstBrand = "hikvision" | "dahua" | "uniview";

export type KstCategorySources = {
  nvr: string;
  poeSwitches: string[];
  cameras: string[];
  hdd: string[];
};

export const kstCctvSources: Record<KstBrand, KstCategorySources> = {
  hikvision: {
    nvr: "https://www.kstsystem.co.th/category/Hikvision-NVR",
    poeSwitches: [],
    cameras: [
      "https://www.kstsystem.co.th/category/Hikvision-EasyIP-4.0-Acusense",
      "https://www.kstsystem.co.th/category/%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%A7%E0%B8%87%E0%B8%88%E0%B8%A3%E0%B8%9B%E0%B8%B4%E0%B8%94-Hikvision-EasyIP-4.0-ColorVu-4MP",
    ],
    hdd: ["https://www.kstsystem.co.th/category/WD-Purple", "https://www.kstsystem.co.th/category/Seagate-SkyHawk"],
  },
  dahua: {
    nvr: "https://www.kstsystem.co.th/17615548/dahua-nvr",
    poeSwitches: ["https://www.kstsystem.co.th/category/Dahua-Switch", "https://www.kstsystem.co.th/category/RG-NBS3100-Series-(PoE)"],
    cameras: [
      "https://www.kstsystem.co.th/category/Dahua-IPC-Lite-4MP",
      "https://www.kstsystem.co.th/category/Dahua-IPC-WizSense-4MP",
    ],
    hdd: ["https://www.kstsystem.co.th/category/WD-Purple", "https://www.kstsystem.co.th/category/Seagate-SkyHawk"],
  },
  uniview: {
    nvr: "https://www.kstsystem.co.th/unv-nvr",
    poeSwitches: ["https://www.kstsystem.co.th/category/RG-NBS3100-Series-(PoE)"],
    cameras: ["https://www.kstsystem.co.th/category/%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%A7%E0%B8%87%E0%B8%88%E0%B8%A3%E0%B8%9B%E0%B8%B4%E0%B8%94-UNV-IP-Camera"],
    hdd: ["https://www.kstsystem.co.th/category/WD-Purple", "https://www.kstsystem.co.th/category/Seagate-SkyHawk"],
  },
};
