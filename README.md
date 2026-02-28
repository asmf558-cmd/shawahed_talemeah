# 🎓 شواهد تعليمية — Production Deployment Guide

> **النشر الكامل خطوة بخطوة** — من الصفر إلى الإنتاج في 20 دقيقة

---

## 📋 المتطلبات

| الأداة | الإصدار | الرابط |
|--------|---------|--------|
| Node.js | 18+ | https://nodejs.org |
| Git | أي إصدار | https://git-scm.com |
| حساب Supabase | مجاني | https://supabase.com |
| حساب Vercel | مجاني | https://vercel.com |
| مفتاح Anthropic | مدفوع | https://console.anthropic.com |

---

## 🗄️ الخطوة 1: إعداد Supabase (قاعدة البيانات)

### 1.1 إنشاء المشروع
1. اذهب إلى https://supabase.com وأنشئ حساباً
2. انقر **New Project**
3. اختر اسم المشروع: `shawahed-talimiya`
4. اختر المنطقة: **Middle East (Bahrain)** — أقرب للمستخدمين السعوديين
5. انتظر إنشاء المشروع (~2 دقيقة)

### 1.2 تشغيل قاعدة البيانات
1. في Supabase Dashboard → **SQL Editor**
2. انقر **New Query**
3. الصق محتوى ملف `supabase/migrations/001_schema.sql` وشغّله
4. انقر **New Query** مرة أخرى
5. الصق محتوى `supabase/migrations/002_storage.sql` وشغّله

### 1.3 إعداد تسجيل الدخول
1. اذهب إلى **Authentication → Providers**
2. فعّل **Email** provider
3. اذهب إلى **Authentication → URL Configuration**
4. أضف Site URL: `https://your-project.vercel.app`
5. أضف Redirect URL: `https://your-project.vercel.app/**`

### 1.4 تخصيص رسالة Magic Link (اختياري — عربية)
1. **Authentication → Email Templates → Magic Link**
2. Subject: `رابط دخول شواهد تعليمية`
3. Body:
```html
<div dir="rtl" style="font-family: Arial; direction: rtl; text-align: right;">
  <h2>مرحباً 👋</h2>
  <p>انقر على الزر أدناه لتسجيل الدخول إلى منصة شواهد تعليمية:</p>
  <a href="{{ .ConfirmationURL }}" style="background:#0d9488;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">
    دخول إلى المنصة ←
  </a>
  <p style="color:#666;font-size:12px;margin-top:20px;">هذا الرابط صالح لمدة ساعة واحدة فقط</p>
</div>
```

### 1.5 جمع المفاتيح
من **Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL    = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY    = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 الخطوة 2: النشر على Vercel

### 2.1 رفع الكود على GitHub
```bash
cd shawahed-production

# تهيئة Git
git init
git add .
git commit -m "feat: شواهد تعليمية v1.0 - production ready"

# إنشاء Repository على GitHub ثم:
git remote add origin https://github.com/YOUR_USERNAME/shawahed-talimiya.git
git branch -M main
git push -u origin main
```

### 2.2 ربط Vercel
1. اذهب إلى https://vercel.com وأنشئ حساباً بـ GitHub
2. انقر **Add New → Project**
3. اختر مستودع `shawahed-talimiya`
4. Framework: **Next.js** (يكتشف تلقائياً)
5. **لا** تنقر Deploy بعد — أضف المتغيرات أولاً

### 2.3 إضافة متغيرات البيئة
في Vercel → Settings → Environment Variables:

| Key | Value | Environments |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Production |

> ⚠️ **مهم**: `SUPABASE_SERVICE_ROLE_KEY` و `ANTHROPIC_API_KEY` **لا** يكونان `NEXT_PUBLIC_` أبداً

### 2.4 النشر
```bash
# انقر Deploy في Vercel
# أو من Terminal:
npm install -g vercel
vercel login
vercel --prod
```

### 2.5 تحديث URL في Supabase
بعد ظهور رابط Vercel (مثلاً `https://shawahed-talimiya.vercel.app`):
1. ارجع إلى Supabase → **Authentication → URL Configuration**
2. Site URL: `https://shawahed-talimiya.vercel.app`
3. Redirect URLs: `https://shawahed-talimiya.vercel.app/**`

---

## 🔧 الخطوة 3: التطوير المحلي

```bash
# نسخ المتغيرات
cp .env.example .env.local
# عبّئ .env.local بالقيم الحقيقية من Supabase

# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev
# → http://localhost:3000
```

---

## 📊 هيكل قاعدة البيانات

```
teachers
├── id (UUID, PK)
├── auth_id (UUID, FK → auth.users, UNIQUE)
├── name (TEXT)
├── email (TEXT, UNIQUE)
├── phone (TEXT, nullable)
├── gender (male|female, nullable)
├── school (TEXT, nullable)
├── subject (TEXT, nullable)
├── is_complete (BOOLEAN, default false)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

reports
├── id (UUID, PK)
├── teacher_id (UUID, FK → teachers)
├── title (TEXT)
├── date (DATE)
├── grade, subject, activity_type (TEXT)
├── description, objectives, steps (TEXT)
├── outcomes, tools, evaluation (TEXT)
├── criteria_id, criteria_label (TEXT)
├── teacher_gender (TEXT)
├── status (draft|ready|shared)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

report_images
├── id (UUID, PK)
├── report_id (UUID, FK → reports)
├── storage_path (TEXT) ← مسار خاص في Bucket
├── is_blurred (BOOLEAN)
├── sort_order (INTEGER)
└── created_at (TIMESTAMPTZ)
```

---

## 🔒 الأمان المُطبَّق

| الميزة | الحالة | التفاصيل |
|--------|--------|---------|
| HTTPS | ✅ تلقائي | Vercel يفعّله تلقائياً |
| RLS على Teachers | ✅ مفعّل | كل معلم يرى بياناته فقط |
| RLS على Reports | ✅ مفعّل | FK → teacher_id |
| RLS على Images | ✅ مفعّل | مرتبط بـ teacher_id |
| Private Storage | ✅ مفعّل | Bucket خاص بدون روابط عامة |
| Signed URLs | ✅ مفعّل | تنتهي بعد ساعة |
| ENV Separation | ✅ مفعّل | .env.local ≠ Production |
| Secret Keys | ✅ آمن | لا NEXT_PUBLIC للمفاتيح السرية |
| Security Headers | ✅ مفعّل | next.config.js |

---

## 🔄 نشر التحديثات مستقبلاً

```bash
# بعد أي تعديل:
git add .
git commit -m "feat: وصف التعديل"
git push origin main
# → Vercel يُعيد النشر تلقائياً في ثوانٍ
```

---

## 📁 هيكل الملفات

```
shawahed-production/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← الواجهة الكاملة
│   │   ├── layout.tsx            ← HTML Layout
│   │   ├── globals.css           ← CSS عام
│   │   └── api/
│   │       ├── generate-report/  ← AI generation (Anthropic)
│   │       │   └── route.ts
│   │       ├── reports/          ← CRUD التقارير
│   │       │   └── route.ts
│   │       ├── teacher/          ← CRUD المعلم
│   │       │   └── route.ts
│   │       └── upload-image/     ← رفع الصور الخاص
│   │           └── route.ts
│   └── lib/
│       └── supabase.ts           ← Supabase Client + Types
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql        ← قاعدة البيانات + RLS
│       └── 002_storage.sql       ← Storage Bucket + Policies
├── .env.example                  ← نموذج المتغيرات
├── .env.local                    ← متغيراتك (لا ترفعه!)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── vercel.json
└── deploy.sh
```

---

## 🛠️ استكشاف الأخطاء

### مشكلة: تسجيل الدخول لا يعمل
- تحقق من Site URL في Supabase Authentication
- تأكد من إضافة `https://your-domain.vercel.app/**` في Redirect URLs

### مشكلة: الصور لا تُرفع
- تأكد من تشغيل `002_storage.sql`
- تحقق من صلاحيات الـ Bucket في Supabase Storage

### مشكلة: AI لا يولّد التقارير
- تحقق من `ANTHROPIC_API_KEY` في Vercel Environment Variables
- تأكد أن المفتاح لديه رصيد كافٍ

### مشكلة: Database error
- تأكد من تشغيل كلا ملفي SQL بالترتيب
- تحقق من RLS policies في Supabase Dashboard

---

## 📞 الدعم والتوسع المستقبلي

المشروع مبني على:
- **Next.js 14** — قابل للتوسع بسهولة
- **Supabase** — يدعم ملايين المستخدمين
- **Vercel** — نشر تلقائي عند كل push

لإضافة ميزات جديدة:
1. عدّل الكود محلياً في `src/`
2. `git push` → Vercel ينشر تلقائياً
3. لتعديل قاعدة البيانات: أضف ملف SQL جديد في `supabase/migrations/`

---

*شواهد تعليمية v1.0 — مُعدّ للإنتاج*
