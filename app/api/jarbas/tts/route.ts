import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createElevenLabsSpeech } from "@/lib/tts/elevenlabs";

type JarbasTtsRequest = {
  text?: string;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as JarbasTtsRequest;
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }

  const speech = await createElevenLabsSpeech({ text });

  if (!speech.ok) {
    if (speech.status === "not_configured") {
      return new Response(null, { status: 204 });
    }

    return NextResponse.json({ error: speech.status }, { status: 502 });
  }

  return new Response(speech.audio, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": speech.contentType,
    },
  });
}
