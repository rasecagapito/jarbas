import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/jarbas/tts/route";

const getUserMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

vi.mock("@/lib/tts/elevenlabs", () => ({
  createElevenLabsSpeech: vi.fn(async ({ text }: { text: string }) => {
    if (text === "sem config") {
      return { ok: false, status: "not_configured" };
    }

    return {
      ok: true,
      audio: new Uint8Array([1, 2, 3]).buffer,
      contentType: "audio/mpeg",
    };
  }),
}));

describe("POST /api/jarbas/tts", () => {
  it("requires authentication", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/tts", {
        method: "POST",
        body: JSON.stringify({ text: "Ola" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 204 when ElevenLabs is not configured so the browser can fallback", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/tts", {
        method: "POST",
        body: JSON.stringify({ text: "sem config" }),
      }),
    );

    expect(response.status).toBe(204);
  });

  it("returns generated audio for authenticated users", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/tts", {
        method: "POST",
        body: JSON.stringify({ text: "Ola" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
  });
});
