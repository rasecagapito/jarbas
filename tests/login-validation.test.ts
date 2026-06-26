import { describe, expect, it } from "vitest";
import {
  getLoginErrorMessage,
  validateLoginCredentials,
} from "@/lib/auth/login";

describe("login validation", () => {
  it("requires e-mail and password", () => {
    expect(validateLoginCredentials("", "")).toEqual({
      ok: false,
      message: "Informe e-mail e senha para acessar o Jarbas.",
    });
  });

  it("accepts trimmed credentials", () => {
    expect(validateLoginCredentials(" user@example.com ", " secret ")).toEqual({
      ok: true,
      email: "user@example.com",
      password: "secret",
    });
  });

  it("returns a neutral invalid credentials message", () => {
    expect(getLoginErrorMessage(new Error("Invalid login credentials"))).toBe(
      "E-mail ou senha invalidos.",
    );
  });
});
