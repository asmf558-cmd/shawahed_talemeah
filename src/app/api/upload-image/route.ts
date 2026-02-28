import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { imageBase64, reportId, sortOrder, isBlurred } = body;

    if (!imageBase64 || !reportId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer     = Buffer.from(base64Data, "base64");
    const ext        = imageBase64.startsWith("data:image/png") ? "png" : "jpg";
    // Path: userId/reportId/timestamp.ext (private per user)
    const path       = `${user.id}/${reportId}/${Date.now()}_${sortOrder}.${ext}`;

    // Upload to private bucket
    const { error: uploadError } = await supabase.storage
      .from("report-images")
      .upload(path, buffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Save path to report_images table (NOT the public URL)
    const { data: imgRow, error: dbError } = await supabase
      .from("report_images")
      .insert({ report_id: reportId, storage_path: path, is_blurred: isBlurred, sort_order: sortOrder })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ id: imgRow.id, path });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[upload-image]", err);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}

// GET: توليد رابط موقَّع مؤقت (Signed URL)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "No path" }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Signed URL صالح لمدة ساعة فقط
  const { data, error } = await supabase.storage
    .from("report-images")
    .createSignedUrl(path, 3600);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
