import { NextResponse } from "next/server";
import { callAiProvider } from "@/lib/ai/provider";
import type { AiMessage } from "@/lib/ai/types";
import { handleJarbasCommand } from "@/lib/jarbas/commands";
import {
  buildJarbasContext,
  createJarbasSystemPrompt,
} from "@/lib/jarbas/context";
import { saveJarbasWrapupMemory } from "@/lib/jarbas/memory";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_CHAT_POLICY = {
  primary: {
    providerSlug: "openai" as const,
    modelKey: "default-chat",
  },
  temperature: 0.2,
  maxOutputTokens: 800,
};

type JarbasChatRequest = {
  message?: string;
  channel?: "text" | "voice";
};

function getAssistantMessage(result: Awaited<ReturnType<typeof callAiProvider>>) {
  if (result.ok) return result.content;

  return result.message;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as JarbasChatRequest;
  const message = body.message?.trim();
  const channel = body.channel === "voice" ? "voice" : "text";

  if (!message) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  const jarbasContext = await buildJarbasContext({
    supabase,
    userId: authData.user.id,
  });
  const commandResult = handleJarbasCommand(message, jarbasContext);

  if (commandResult.handled) {
    const { error: insertError } = await supabase
      .from("conversation_history")
      .insert([
        {
          user_id: authData.user.id,
          role: "user",
          channel,
          message,
        },
        {
          user_id: authData.user.id,
          role: "assistant",
          channel,
          message: commandResult.message,
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: "conversation_persist_failed" },
        { status: 500 },
      );
    }

    if (commandResult.persistAsMemory) {
      await saveJarbasWrapupMemory({
        supabase,
        userId: authData.user.id,
        groupId: jarbasContext.groups[0]?.id ?? null,
        body: commandResult.message,
      });
    }

    return NextResponse.json({
      message: commandResult.message,
      channel,
      command: commandResult.command,
      persistAsMemory: commandResult.persistAsMemory,
    });
  }

  const systemPrompt = createJarbasSystemPrompt(jarbasContext);
  const messages: AiMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  const aiResult = await callAiProvider({
    messages,
    policy: DEFAULT_CHAT_POLICY,
  });
  const assistantMessage = getAssistantMessage(aiResult);

  const { error: insertError } = await supabase
    .from("conversation_history")
    .insert([
      {
        user_id: authData.user.id,
        role: "user",
        channel,
        message,
      },
      {
        user_id: authData.user.id,
        role: "assistant",
        channel,
        message: assistantMessage,
      },
    ]);

  if (insertError) {
    return NextResponse.json(
      { error: "conversation_persist_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: assistantMessage,
    channel,
  });
}
