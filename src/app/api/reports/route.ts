import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function makeSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );
}

// GET — جلب كل تقارير المعلم
export async function GET() {
  const supabase = makeSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get teacher ID
  const { data: teacher } = await supabase
    .from("teachers").select("id").eq("auth_id", user.id).single();
  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("reports")
    .select(`*, report_images(id, storage_path, is_blurred, sort_order)`)
    .eq("teacher_id", teacher.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — إنشاء تقرير جديد
export async function POST(req: NextRequest) {
  const supabase = makeSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: teacher } = await supabase
    .from("teachers").select("id, is_complete, gender").eq("auth_id", user.id).single();

  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  if (!teacher.is_complete) return NextResponse.json({ error: "يجب إكمال الملف الشخصي أولاً" }, { status: 403 });

  const body = await req.json();
  const { title, date, grade, subject, activity_type, description, objectives, steps,
          outcomes, tools, evaluation, criteria_id, criteria_label } = body;

  if (!title || !grade || !subject || !activity_type) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      teacher_id: teacher.id, title, date, grade, subject,
      activity_type, description, objectives, steps, outcomes,
      tools, evaluation, criteria_id, criteria_label,
      teacher_gender: teacher.gender || "male", status: "ready",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH — تحديث تقرير
export async function PATCH(req: NextRequest) {
  const supabase = makeSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

  const { data, error } = await supabase
    .from("reports").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — حذف تقرير
export async function DELETE(req: NextRequest) {
  const supabase = makeSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

  // حذف الصور من Storage أولاً
  const { data: images } = await supabase
    .from("report_images").select("storage_path").eq("report_id", id);

  if (images?.length) {
    await supabase.storage.from("report-images").remove(images.map(i => i.storage_path));
  }

  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
