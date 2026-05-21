export interface GalleryImage {
  image: string;
  caption?: string;
}

export interface PortfolioItem {
  title: string;
  category: string;
  description?: string;
  location?: string;
  date?: string;
  featured_image: string;
  gallery?: GalleryImage[];
  link?: string;
  published: boolean;
}

export const portfolioCategories = [
  "ทั้งหมด",
  "ต่อเติมและรีโนเวท",
  "ติดตั้งโซล่าเซลล์",
  "ระบบไฟฟ้า",
  "ระบบแสงสว่าง",
  "ระบบ CCTV",
  "อื่น ๆ",
];

export const portfolioItems: PortfolioItem[] = [
  {
    title: "โครงการรีโนเวทอาคารพาณิชย์",
    category: "ต่อเติมและรีโนเวท",
    description: "ปรับปรุงโครงสร้างและตกแต่งภายในอาคารพาณิชย์ให้ทันสมัย",
    location: "ชลบุรี",
    date: "2024-01-15",
    featured_image: "/images/portfolio/renovate/commercial_featured_final.jpg",
    gallery: [
      {
        image: "/images/portfolio/renovate/481199416_1359929375443853_2204846716806201200_n.jpg",
        caption: "งานรีโนเวทอาคารพาณิชย์ด้านหน้า",
      },
      {
        image: "/images/portfolio/renovate/480467107_1359928205443970_6873116217130309152_n.jpg",
        caption: "งานตกแต่งภายในอาคาร",
      },
      {
        image: "/images/portfolio/renovate/480555186_1359947458775378_4041487267011488691_n.jpg",
        caption: "งานระบบไฟฟ้าและแสงสว่าง",
      },
      {
        image: "/images/portfolio/renovate/484089211_1374739840629473_1199222055835335086_n.jpg",
        caption: "งานผนังและพื้น",
      },
      {
        image: "/images/portfolio/renovate/480439796_1356245002478957_6764352336728129585_n.jpg",
        caption: "งานประตูและหน้าต่าง",
      },
      {
        image: "/images/portfolio/renovate/492574607_1409325017170955_5439319349492860166_n.jpg",
        caption: "ภาพรวมโครงการเสร็จสิ้น",
      },
    ],
    published: true,
  },
  {
    title: "งานรีโนเวทบ้านพักอาศัย",
    category: "ต่อเติมและรีโนเวท",
    description: "รีโนเวทห้องนั่งเล่นและห้องครัวสไตล์มินิมอล",
    location: "นครสวรรค์",
    date: "2024-02-10",
    featured_image: "/images/portfolio/renovate/residential_featured.jpg",
    gallery: [
      {
        image: "/images/portfolio/renovate/480317863_1359929185443872_6946517117472118898_n.jpg",
        caption: "ห้องนั่งเล่นหลังรีโนเวท",
      },
      {
        image: "/images/portfolio/renovate/483950596_1374739623962828_3936861051991646482_n.jpg",
        caption: "ห้องครัวสไตล์มินิมอล",
      },
      {
        image: "/images/portfolio/renovate/480460556_1359928275443963_5190369852008110952_n.jpg",
        caption: "งานตกแต่งและเฟอร์นิเจอร์",
      },
      {
        image: "/images/portfolio/renovate/488049306_1389596519143805_1606307762565975541_n.jpg",
        caption: "งานระบบน้ำและท่อ",
      },
      {
        image: "/images/portfolio/renovate/494049703_1409324237171033_4864961002848039287_n.jpg",
        caption: "งานไฟฟ้าและแสงสว่าง",
      },
      {
        image: "/images/portfolio/renovate/481066215_1359928268777297_801345504377277401_n.jpg",
        caption: "ภาพรวมบ้านพักเสร็จสิ้น",
      },
    ],
    published: true,
  },
  {
    title: "งานต่อเติมพื้นที่อเนกประสงค์",
    category: "ต่อเติมและรีโนเวท",
    description: "ต่อเติมโรงจอดรถและพื้นที่ซักล้างหลังบ้าน",
    location: "ชลบุรี",
    date: "2024-03-05",
    featured_image: "/images/portfolio/renovate/extension_featured.jpg",
    gallery: [
      {
        image: "/images/portfolio/renovate/480713289_1359928382110619_9107853437693770149_n.jpg",
        caption: "โรงจอดรถต่อเติม",
      },
      {
        image: "/images/portfolio/renovate/480307506_1359947492108708_8290198814217416459_n.jpg",
        caption: "พื้นที่ซักล้างหลังบ้าน",
      },
      {
        image: "/images/portfolio/renovate/480871367_1359929412110516_5353576956154485433_n.jpg",
        caption: "งานระบบท่อและระบายน้ำ",
      },
      {
        image: "/images/portfolio/renovate/481177569_1364545621648895_1933032333680324380_n.jpg",
        caption: "งานไฟฟ้าและแสงสว่าง",
      },
      {
        image: "/images/portfolio/renovate/480745872_1359928128777311_7923583716871975946_n.jpg",
        caption: "งานผนังและพื้น",
      },
      {
        image: "/images/portfolio/renovate/487802706_1389594809143976_7032018464623556443_n.jpg",
        caption: "ภาพรวมพื้นที่ต่อเติมเสร็จสิ้น",
      },
    ],
    published: true,
  },
  {
    title: "ติดตั้งโซล่าเซลล์ บ้านพัก",
    category: "ติดตั้งโซล่าเซลล์",
    description: "ติดตั้งแผงโซล่าเซลล์ 10 kW พร้อมระบบ Inverter และแบตเตอรี่",
    location: "นครสวรรค์",
    date: "2024-02-20",
    featured_image:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=1200&auto=format&fit=crop&q=85",
        caption: "แผงโซลาร์เซลล์บนหลังคา",
      },
      {
        image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=1200&auto=format&fit=crop&q=85",
        caption: "ระบบพลังงานแสงอาทิตย์",
      },
    ],
    published: true,
  },
  {
    title: "ระบบไฟฟ้าโรงงาน",
    category: "ระบบไฟฟ้า",
    description: "ติดตั้งระบบไฟฟ้าแรงสูง 3 เฟส พร้อมตู้ MDB และระบบสายดิน",
    location: "ชลบุรี",
    date: "2024-03-10",
    featured_image: "/images/portfolio/electrical/factory_featured.jpg",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&auto=format&fit=crop&q=85",
        caption: "ตู้ควบคุมและระบบไฟฟ้า",
      },
      {
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=85",
        caption: "งานตรวจเช็กระบบไฟฟ้าอุตสาหกรรม",
      },
    ],
    published: true,
  },
  {
    title: "ติดตั้งระบบแสงสว่างอาคาร",
    category: "ระบบแสงสว่าง",
    description: "ออกแบบและติดตั้งไฟ LED สำหรับพื้นที่สำนักงานและอาคารพาณิชย์",
    location: "นครสวรรค์",
    date: "2024-04-18",
    featured_image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=85",
    gallery: [
      {
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=85",
        caption: "โคมไฟ LED ภายในอาคาร",
      },
    ],
    published: true,
  },
  {
    title: "ระบบกล้องวงจรปิด IP Camera ร้านค้า",
    category: "ระบบ CCTV",
    description:
      "ติดตั้งระบบกล้อง IP Camera พร้อมระบบบันทึกและการดูภาพผ่านมือถือแบบ Real-time",
    location: "บรรพตพิสัย",
    date: "2024-05-05",
    featured_image: "/images/portfolio/cctv/186272_0.jpg",
    gallery: [
      {
        image: "/images/portfolio/cctv/186272_0.jpg",
        caption: "กล้อง IP Camera ติดตั้งหน้าร้านค้า",
      },
      {
        image: "/images/portfolio/cctv/186273_0.jpg",
        caption: "ระบบบันทึกและการจัดการวิดีโอ",
      },
      {
        image: "/images/portfolio/cctv/186274_0.jpg",
        caption: "ระบบมอนิเตอร์และควบคุม",
      },
      {
        image: "/images/portfolio/cctv/186275_0.jpg",
        caption: "การติดตั้งสายเคเบิลและอุปกรณ์",
      },
      {
        image: "/images/portfolio/cctv/186276_0.jpg",
        caption: "ภาพรวมระบบ CCTV เสร็จสิ้น",
      },
    ],
    published: true,
  },
];

