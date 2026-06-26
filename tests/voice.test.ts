import { describe, expect, it } from "vitest";
import {
  getGreeting,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
} from "@/lib/voice";

describe("getGreeting", () => {
  it("uses display name when available", () => {
    expect(getGreeting("Cesar")).toContain("Ola, Cesar.");
  });

  it("does not invent a name when display name is missing", () => {
    expect(getGreeting(null)).toContain("Ola. Eu sou o Jarbas.");
  });
});

describe("voice feature detection", () => {
  it("returns booleans for browser capabilities", () => {
    expect(typeof isSpeechRecognitionAvailable()).toBe("boolean");
    expect(typeof isSpeechSynthesisAvailable()).toBe("boolean");
  });
});
