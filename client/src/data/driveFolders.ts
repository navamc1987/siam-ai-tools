export type DriveFolderGallery = {
  id: string;
  title: string;
  folderUrl: string;
  folderId: string;
};

export type DriveGalleryGroup = {
  id: string;
  title: string;
  galleries: DriveFolderGallery[];
};

export const driveGalleryGroups: DriveGalleryGroup[] = [
  {
    id: "renovation",
    title: "ต่อเติม & รีโนเวท",
    galleries: [
      {
        id: "roof",
        title: "งานหลังคา",
        folderUrl:
          "https://drive.google.com/drive/folders/1zi5WKYtj2vy0mewRNHcfP5AFv8dUe6MX?usp=sharing",
        folderId: "1zi5WKYtj2vy0mewRNHcfP5AFv8dUe6MX",
      },
      {
        id: "ceiling",
        title: "งานฝ้าเพดาน",
        folderUrl:
          "https://drive.google.com/drive/folders/19uHEVVsd_7B_u1V9fuH8xCHDxWv50Ass?usp=sharing",
        folderId: "19uHEVVsd_7B_u1V9fuH8xCHDxWv50Ass",
      },
      {
        id: "steel",
        title: "งานเชื่อมเหล็กโครงสร้าง",
        folderUrl:
          "https://drive.google.com/drive/folders/1z89Ap29lNZ5BdP_Qxn0BT4YNG-6elWPU?usp=drive_link",
        folderId: "1z89Ap29lNZ5BdP_Qxn0BT4YNG-6elWPU",
      },
      {
        id: "tile",
        title: "งานปูกระเบื้อง",
        folderUrl:
          "https://drive.google.com/drive/folders/1Vw35SZ1JchFi4cZzLzqqzwwpYwOMHlJ5?usp=sharing",
        folderId: "1Vw35SZ1JchFi4cZzLzqqzwwpYwOMHlJ5",
      },
    ],
  },
  {
    id: "systems",
    title: "งานระบบ",
    galleries: [
      {
        id: "network",
        title: "ระบบ NETWORK",
        folderUrl:
          "https://drive.google.com/drive/folders/17YGt1yAJDEoFH6Vu9N4a55VTaAnGtUAH?usp=drive_link",
        folderId: "17YGt1yAJDEoFH6Vu9N4a55VTaAnGtUAH",
      },
      {
        id: "cctv",
        title: "ระบบ CCTV",
        folderUrl:
          "https://drive.google.com/drive/folders/1JIjkjnK8JSVDAWyRWSCO12Xvc4f0_x3x?usp=drive_link",
        folderId: "1JIjkjnK8JSVDAWyRWSCO12Xvc4f0_x3x",
      },
      {
        id: "electrical",
        title: "ระบบไฟฟ้า",
        folderUrl:
          "https://drive.google.com/drive/folders/1eiZXqSejm3EXP_ycsbtEtAVxSuc_bn5e?usp=drive_link",
        folderId: "1eiZXqSejm3EXP_ycsbtEtAVxSuc_bn5e",
      },
    ],
  },
];
