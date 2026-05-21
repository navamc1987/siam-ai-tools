# การตั้งค่า Decap CMS บน Cloudflare Pages

## 📋 ข้อมูลที่คุณมี

- **Client ID**: `YOUR_GITHUB_OAUTH_CLIENT_ID`
- **Client Secret**: `YOUR_GITHUB_OAUTH_CLIENT_SECRET`

## ✅ ขั้นตอนการตั้งค่า

### ขั้นตอนที่ 1: ตั้งค่า Environment Variables ใน Cloudflare

1. เข้าสู่ **Cloudflare Dashboard** (https://dash.cloudflare.com)
2. ไปที่ **Workers & Pages**
3. เลือกโปรเจกต์ของคุณ (siam-ai-tools)
4. ไปที่แท็บ **Settings**
5. ค้นหา **Environment variables** และคลิก **Add variables**

**สำหรับ Production:**
- **Variable name**: `DECAP_CMS_CLIENT_ID` | **Value**: `YOUR_GITHUB_OAUTH_CLIENT_ID`
- **Variable name**: `DECAP_CMS_CLIENT_SECRET` | **Value**: `YOUR_GITHUB_OAUTH_CLIENT_SECRET`

**สำหรับ Preview (ถ้าต้องการทดสอบ):**
- ทำซ้ำขั้นตอนเดียวกัน

6. กด **Save and deploy**

### ขั้นตอนที่ 2: ตรวจสอบ Cloudflare Pages Functions

Cloudflare จะสร้างระบบ OAuth โดยอัตโนมัติจากไฟล์ที่ผมสร้างไว้:

- `/functions/admin/oauth.ts` - เริ่มการล็อกอิน
- `/functions/admin/callback.ts` - รับ token จาก GitHub

**หลังจาก Push code ไปยัง GitHub:**
1. Cloudflare จะ auto-deploy โปรเจกต์
2. ระบบ OAuth จะพร้อมใช้งานที่:
   - ล็อกอิน: `https://siamai.cloud/admin/oauth`
   - Callback: `https://siamai.cloud/admin/callback`

### ขั้นตอนที่ 3: เข้าใช้งาน CMS

1. เปิด `https://siamai.cloud/admin`
2. กดปุ่ม **Login with GitHub**
3. ระบบจะนำคุณไปยังหน้า GitHub เพื่อยืนยันตัวตน
4. หลังจากยืนยันสำเร็จ คุณจะกลับมาที่ CMS พร้อมใช้งาน

## 🔐 ความปลอดภัย

- ห้ามใส่ Client Secret ลงในไฟล์ใน repository
- เก็บ Client Secret ไว้ใน Cloudflare Environment Variables เท่านั้น
- **OAuth State** ใช้เพื่อป้องกัน CSRF attacks
- **HTTPS only** - ทั้งหมดเป็น secure connections

## 📝 การเพิ่มผลงานใหม่

หลังจากล็อกอินสำเร็จ:

1. ไปที่ **Collections** → **ผลงานของเรา**
2. กดปุ่ม **New Portfolio**
3. กรอกข้อมูล:
   - ชื่อโครงการ
   - หมวดหมู่
   - รายละเอียด
   - สถานที่ และวันที่
   - รูปภาพหลัก
   - แกลเลอรี่รูปภาพ
4. กดปุ่ม **Publish**

## 🔄 การอัปเดตเว็บไซต์

หลังจาก Publish ผลงาน:

1. ไฟล์ Markdown จะถูกบันทึกใน GitHub repository
2. Cloudflare จะ auto-deploy โปรเจกต์
3. หน้า Portfolio จะแสดงผลงานใหม่โดยอัตโนมัติ

## 🆘 ปัญหาที่อาจเกิดขึ้น

### ปัญหา: "Unauthorized" เมื่อล็อกอิน
**วิธีแก้:**
- ตรวจสอบ Environment Variables ใน Cloudflare ถูกต้องหรือไม่
- ตรวจสอบว่า Client ID และ Secret ตรงกับ GitHub OAuth App

### ปัญหา: OAuth callback ไม่ทำงาน
**วิธีแก้:**
- ตรวจสอบว่า Cloudflare Pages Functions ถูก deploy แล้ว
- ตรวจสอบ GitHub OAuth App settings:
  - **Authorization callback URL** ต้องเป็น: `https://siamai.cloud/admin/callback`

### ปัญหา: รูปภาพไม่อัปโหลดได้
**วิธีแก้:**
- ตรวจสอบว่า repository มีสิทธิ์เขียนไฟล์
- ตรวจสอบขนาดไฟล์ (ต้อง < 5MB)

## 📞 ติดต่อสำหรับความช่วยเหลือ

หากมีปัญหาในการตั้งค่า โปรดติดต่อทีมพัฒนา

---

**สร้างเมื่อ**: May 16, 2026
**เวอร์ชัน**: 1.0 (Cloudflare Pages)
