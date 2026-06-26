import { signIn } from "@/app/(auth)/login/actions";

export function LoginForm({ message }: { message: string | null }) {
  return (
    <form
      action={signIn}
      className="jarbas-glass relative mx-auto w-full max-w-md overflow-hidden rounded-lg p-6 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jarbas-cyan to-transparent" />

      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-jarbas-cyan">
          Acesso seguro
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-jarbas-blue sm:text-4xl">
          Jarbas
        </h1>
        <p className="mt-3 text-sm leading-6 text-jarbas-muted">
          Sessao operacional protegida para o cockpit S.A.M.
        </p>
      </div>

      {message ? (
        <p className="mt-6 rounded-lg border border-jarbas-cyan/30 bg-jarbas-panel/80 px-4 py-3 text-sm text-jarbas-text">
          {message}
        </p>
      ) : null}

      <label
        className="mt-6 block font-mono text-xs uppercase tracking-[0.16em] text-jarbas-cyan"
        htmlFor="email"
      >
        E-mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        className="mt-2 w-full rounded-lg border border-white/10 bg-jarbas-bg/70 px-4 py-3 text-jarbas-text outline-none transition focus:border-jarbas-cyan focus:shadow-[0_0_24px_rgba(0,219,233,0.18)]"
        placeholder="operador@empresa.com"
        required
      />

      <label
        className="mt-4 block font-mono text-xs uppercase tracking-[0.16em] text-jarbas-cyan"
        htmlFor="password"
      >
        Senha
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        className="mt-2 w-full rounded-lg border border-white/10 bg-jarbas-bg/70 px-4 py-3 text-jarbas-text outline-none transition focus:border-jarbas-cyan focus:shadow-[0_0_24px_rgba(0,219,233,0.18)]"
        placeholder="************"
        required
      />

      <button
        className="mt-6 w-full rounded-lg bg-jarbas-cyan px-5 py-4 font-display text-base font-semibold text-jarbas-bg shadow-[0_0_34px_rgba(0,219,233,0.28)] transition hover:shadow-[0_0_52px_rgba(0,219,233,0.42)] active:scale-[0.99]"
        type="submit"
      >
        Autorizar sessao
      </button>

      <div className="mt-6 flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.14em] text-jarbas-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-jarbas-cyan" />
          Link seguro
        </span>
        <span>SAP B1</span>
      </div>
    </form>
  );
}
