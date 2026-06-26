import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
  }

  const bucket = "jarbas-uploads";
  const filePath = `${authData.user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("jarbas_uploaded_files")
    .insert({
      user_id: authData.user.id,
      bucket,
      file_path: filePath,
      original_name: file.name,
      mime_type: file.type,
      status: "uploaded",
    })
    .select("id,bucket,file_path,original_name,status")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "file_record_failed" }, { status: 500 });
  }

  return NextResponse.json({ file: inserted });
}
