import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LoginExperience } from "@/components/auth/login-experience";

describe("LoginExperience", () => {
  it("shows the landing first and reveals the login card only after Entrar is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LoginExperience
        loginForm={<section aria-label="login-card">Login card</section>}
        showLoginInitially={false}
      />,
    );

    expect(screen.getByText("A PRÓXIMA GERAÇÃO CHEGOU")).toBeInTheDocument();
    expect(screen.queryByLabelText("login-card")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByLabelText("login-card")).toBeInTheDocument();
  });
});
