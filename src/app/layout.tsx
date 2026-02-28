import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "شواهد تعليمية - توثيق الأنشطة التعليمية",
  description: "منصة ذكية للمعلمين لتوثيق الأنشطة التعليمية وإنشاء التقارير الرسمية باستخدام الذكاء الاصطناعي",
  keywords: "شواهد تعليمية, تقارير معلمين, ذكاء اصطناعي, توثيق تعليمي",
  authors: [{ name: "شواهد تعليمية" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "شواهد تعليمية",
    description: "وثِّق أنشطتك التعليمية بالذكاء الاصطناعي",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Cairo', 'Noto Sans Arabic', Arial, sans-serif" }}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
