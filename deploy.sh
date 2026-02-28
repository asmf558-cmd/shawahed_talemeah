#!/bin/bash
# ================================================================
# شواهد تعليمية — Production Deployment Script
# ================================================================
# الاستخدام: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 بدء نشر شواهد تعليمية..."

# 1. التحقق من وجود المتطلبات
command -v node  >/dev/null || { echo "❌ Node.js غير مثبت"; exit 1; }
command -v npm   >/dev/null || { echo "❌ npm غير مثبت"; exit 1; }

# 2. التحقق من ملف .env.local
if [ ! -f ".env.local" ]; then
  echo "❌ ملف .env.local غير موجود"
  echo "📋 انسخ .env.example إلى .env.local وعبّئ القيم"
  cp .env.example .env.local
  echo "✅ تم إنشاء .env.local — عبّئ القيم ثم أعد التشغيل"
  exit 1
fi

# 3. التحقق من المتغيرات الإلزامية
source .env.local
[ -z "$NEXT_PUBLIC_SUPABASE_URL" ]      && { echo "❌ NEXT_PUBLIC_SUPABASE_URL مفقود"; exit 1; }
[ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && { echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY مفقود"; exit 1; }
[ -z "$ANTHROPIC_API_KEY" ]             && { echo "❌ ANTHROPIC_API_KEY مفقود"; exit 1; }

echo "✅ متغيرات البيئة موجودة"

# 4. تثبيت الحزم
echo "📦 تثبيت الحزم..."
npm ci --prefer-offline 2>/dev/null || npm install

# 5. Build
echo "🔨 بناء النسخة الإنتاجية..."
NODE_ENV=production npm run build

echo ""
echo "✅ اكتمل البناء!"
echo ""
echo "▶️  للتشغيل المحلي: npm start"
echo "🌐 للنشر على Vercel: vercel --prod"
