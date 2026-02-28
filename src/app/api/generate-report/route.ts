import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, activityType, subject, grade, date, criteriaLabel, description, teacherName, schoolName } = body;

    if (!title || !activityType || !subject || !grade) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const prompt = `أنت مساعد تعليمي متخصص في كتابة التقارير الرسمية للمعلمين في المملكة العربية السعودية.

بناءً على المعلومات التالية:
- عنوان النشاط: ${title}
- نوع النشاط: ${activityType}
- المادة: ${subject}
- الصف: ${grade}
- التاريخ: ${date}
- معيار التقييم: ${criteriaLabel || "عام"}
- المعلم: ${teacherName || ""}
- المدرسة: ${schoolName || ""}
- الوصف: ${description || "نشاط تعليمي تفاعلي"}

اكتب تقريراً تعليمياً رسمياً. أجب بـ JSON فقط بدون أي نص خارجي:
{
  "objectives": "الهدف الأول\\nالثاني\\nالثالث\\nالرابع",
  "steps": "الخطوة الأولى\\nالثانية\\nالثالثة\\nالرابعة\\nالخامسة",
  "outcomes": "النتيجة الأولى\\nالثانية\\nالثالثة",
  "tools": "الأداة الأولى - الثانية - الثالثة",
  "evaluation": "تقييم مفصل للنشاط"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());

    return NextResponse.json(result);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[generate-report] Error:", err);
    }
    return NextResponse.json(
      { error: "فشل في توليد التقرير. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
