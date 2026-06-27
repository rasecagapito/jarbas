import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

vi.mock("@/app/(auth)/login/actions", () => ({
  signIn: vi.fn(),
}));

describe("LoginForm", () => {
  it("renders the adapted neural access card while keeping real credential fields", () => {
    render(<LoginForm message="E-mail ou senha inválidos." />);

    expect(screen.getByRole("heading", { name: "Bem-vindo de volta" })).toBeInTheDocument();
    expect(screen.getByLabelText("ID Neural")).toHaveAttribute("name", "email");
    expect(screen.getByLabelText("Cifra de Acesso")).toHaveAttribute("name", "password");
    expect(screen.getByRole("button", { name: /Autorizar sessão/i })).toBeInTheDocument();
    expect(screen.getByText("E-mail ou senha inválidos.")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("X / Core")).toBeInTheDocument();
    expect(screen.getByText("Solicitar convite")).toBeInTheDocument();
  });
});
