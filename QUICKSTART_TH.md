# 🚀 คู่มือเริ่มต้นระบบ Smart Farm (ภาษาไทย)

## 📋 สิ่งที่ต้องเตรียม

1. **Node.js 18+** - ดาวน์โหลดจาก [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - ติดตั้งแบบ local หรือใช้บริการ cloud (Neon, Supabase)
3. **Cloudinary Account** - สมัครฟรีที่ [cloudinary.com](https://cloudinary.com/)
4. **LINE Developers Account** (ถ้าต้องการ LIFF) - สมัครที่ [developers.line.biz](https://developers.line.biz/)

## 🛠️ ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
cd d:/Dev/Learning/Farm_Store
npm install
```

### 2. ตั้งค่า Environment Variables

คัดลอก `.env.example` เป็น `.env` แล้วกรอกข้อมูล:

```bash
copy .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# Database - ใส่ connection string ของ PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/smart_farm?schema=public"

# Auth.js Secret - สร้างด้วยคำสั่งนี้: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-key"
AUTH_URL="http://localhost:3000"

# Cloudinary - หาได้จากหน้า Dashboard
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# LINE LIFF (optional)
NEXT_PUBLIC_LIFF_ID="your-liff-id"
AUTH_LINE_ID="your-line-channel-id"
AUTH_LINE_SECRET="your-line-channel-secret"

# Google OAuth (optional)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Facebook OAuth (optional)
AUTH_FACEBOOK_ID="your-facebook-app-id"
AUTH_FACEBOOK_SECRET="your-facebook-app-secret"
```

### 3. Setup Database

```bash
# สร้าง Prisma Client
npx prisma generate

# รัน migration สร้างตาราง
npx prisma migrate dev --name init

# เพิ่มข้อมูลตัวอย่าง (admin, ชนิดพืช, พันธุ์)
npm run db:seed
```

### 4. รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## 👤 ข้อมูลเข้าสู่ระบบ (หลัง Seed)

**Admin:**
- Email: `admin@smartfarm.com`
- Password: `admin123`

**Farmer (ตัวอย่าง):**
- Email: `farmer@example.com`
- Password: `farmer123`

## 📦 ตั้งค่า Cloudinary

1. ไปที่ [cloudinary.com](https://cloudinary.com/) สมัครบัญชีฟรี
2. ที่หน้า Dashboard คุณจะเห็น:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. คัดลอกค่าเหล่านี้ใส่ในไฟล์ `.env`

## 📱 ตั้งค่า LINE LIFF (ถ้าต้องการ)

### 1. สร้าง LINE Login Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่
3. สร้าง Channel โดยเลือก "LINE Login"
4. ที่หน้า Channel Settings:
   - จด **Channel ID** และ **Channel Secret**
   - เพิ่ม Callback URL: `http://localhost:3000/api/auth/callback/line`

### 2. สร้าง LIFF App

1. ในหน้า LINE Login Channel เลือกแท็บ "LIFF"
2. คลิก "Add" เพื่อสร้าง LIFF App ใหม่
3. ตั้งค่า:
   - **LIFF app name**: Smart Farm
   - **Size**: Full
   - **Endpoint URL**: `http://localhost:3000` (สำหรับ dev)
   - **Scope**: `profile`, `openid`
4. หลังสร้างเสร็จจะได้ **LIFF ID** นำไปใส่ใน `.env`

## 🗺️ ใช้งาน Map Picker

โปรเจคใช้ **Leaflet** (OpenStreetMap) ที่ไม่ต้องใช้ API key

**ฟีเจอร์:**
- คลิกบนแผนที่เพื่อเลือกตำแหน่ง
- ลากปักหมุดเพื่อย้ายตำแหน่ง
- ระบบจะขอ permission ใช้ GPS อัตโนมัติ

## 📸 ใช้งาน Upload รูปภาพ

**ในหน้าบันทึกกิจกรรม:**
1. คลิกปุ่ม "เลือกไฟล์"
2. เลือกรูปได้หลายรูป (สูงสุด 5MB/รูป)
3. รูปจะอัพโหลดไป Cloudinary อัตโนมัติ
4. แสดง preview ก่อนบันทึก
5. คลิกปุ่ม X เพื่อลบรูปที่ไม่ต้องการ

## 🔧 คำสั่งที่ใช้บ่อย

```bash
# รัน development server
npm run dev

# Build production
npm run build

# เช็ค TypeScript errors
npm run type-check

# เปิด Prisma Studio (database GUI)
npm run db:studio

# สร้าง migration ใหม่
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Run seed อีกครั้ง
npm run db:seed
```

## 📂 โครงสร้างโปรเจค

```
Farm_Store/
├── actions/              # Server Actions (CRUD operations)
├── app/
│   ├── (user)/          # หน้าสำหรับเกษตรกร
│   ├── (admin)/         # หน้าสำหรับ Admin
│   └── api/upload/      # API อัพโหลดรูป
├── components/          # React Components
│   ├── ui/             # Shadcn/ui components
│   ├── map-picker.tsx  # ตัวเลือก GPS
│   └── activity-form.tsx  # ฟอร์มบันทึกกิจกรรม
├── lib/                # Utilities
├── prisma/             # Database schema & seed
└── auth.ts             # Authentication config
```

## 🎯 ขั้นตอนถัดไป

1. **สร้างแปลงแรก:**
   - ล็อกอินด้วย farmer account
   - ไปที่ "จัดการแปลง" > "สร้างแปลงใหม่"
   - เลือกตำแหน่งบนแผนที่

2. **เริ่มรอบการปลูก:**
   - เข้าไปที่แปลง > "เริ่มรอบปลูกใหม่"
   - เลือกชนิดพืชและพันธุ์

3. **บันทึกกิจกรรม:**
   - คลิก "เพิ่มกิจกรรม"
   - เลือกประเภท, กรอกรายละเอียด, อัพโหลดรูป

4. **ดูสถิติ:**
   - ดูค่าใช้จ่าย/รายได้ในหน้ารายละเอียดแปลง
   - ติดตาม timeline ตามแผนปลูก

## 🐛 แก้ปัญหา

### Database connection error
- ตรวจสอบ `DATABASE_URL` ใน `.env`
- ตรวจสอบว่า PostgreSQL รันอยู่
- ลอง: `npx prisma db push`

### Cloudinary upload failed
- ตรวจสอบ credentials ใน `.env`
- ตรวจสอบว่ารูปไม่เกิน 5MB
- ตรวจสอบ file type (ต้องเป็น jpg, png, webp)

### Map ไม่แสดง
- ตรวจสอบว่าโหลด Leaflet CSS แล้วใน `app/layout.tsx`
- Clear browser cache
- ตรวจสอบ browser console สำหรับ errors

### ติดปัญหาอื่นๆ
- เช็ค terminal console สำหรับ error messages
- ลองรัน `npm run type-check` เพื่อหา TypeScript errors
- ดู logs ใน browser DevTools Console

## 📚 เอกสารเพิ่มเติม

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js Docs](https://authjs.dev)
- [Leaflet Docs](https://leafletjs.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## 💡 Tips

- ใช้ Prisma Studio (`npm run db:studio`) เพื่อดูข้อมูลในฐานข้อมูล
- รูปภาพที่อัพโหลดจะถูก optimize อัตโนมัติ (resize + compress)
- Standard Plan จะถูกนำมาแสดงเป็น timeline อัตโนมัติ
- แต่ละแปลงมีรอบ ACTIVE ได้แค่รอบเดียว ต้องปิดรอบเก่าก่อนเริ่มรอบใหม่

---

สร้างโดย AI Assistant | เวอร์ชัน 1.0 | พ.ศ. 2568
