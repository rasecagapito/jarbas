import { describe, expect, it, vi } from "vitest";
import { updateSession } from "@/lib/supabase/proxy";

const getUserMock = vi.fn();

vi.mock("@/lib/supabase/config", () => ({
  getSupabaseConfig: () => ({
    url: "https://supabase.example",
    anonKey: "anon-key",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

function createRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`);

  return {
    cookies: {
      getAll: () => [],
      set: vi.fn(),
    },
    nextUrl: {
      pathname,
      clone: () => url,
    },
  };
}

describe("Supabase proxy session guard", () => {
  it("returns JSON 401 for unauthenticated API routes instead of redirecting to login", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: null },
    });

    const response = await updateSession(createRequest("/api/jarbas/chat") as never);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "unauthorized" });
  });
});
