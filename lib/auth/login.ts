export type LoginValidationResult =
  | {
      ok: true;
      email: string;
      password: string;
    }
  | {
      ok: false;
      message: string;
    };

export function validateLoginCredentials(
  email: string,
  password: string,
): LoginValidationResult {
  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      message: "Informe e-mail e senha para acessar o Jarbas.",
    };
  }

  return {
    ok: true,
    email: normalizedEmail,
    password: normalizedPassword,
  };
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Invalid login credentials") {
    return "E-mail ou senha invalidos.";
  }

  return "Nao foi possivel acessar o Jarbas. Tente novamente.";
}

export function getLoginMessageFromCode(code?: string): string | null {
  if (code === "missing") {
    return "Informe e-mail e senha para acessar o Jarbas.";
  }

  if (code === "invalid") {
    return "E-mail ou senha invalidos.";
  }

  if (code === "signed-out") {
    return "Sessao encerrada com sucesso.";
  }

  if (code === "error") {
    return "Nao foi possivel acessar o Jarbas. Tente novamente.";
  }

  return null;
}
