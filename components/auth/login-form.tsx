import { signIn } from "@/app/(auth)/login/actions";

export function LoginForm({ message }: { message: string | null }) {
  return (
    <form
      action={signIn}
      className="w-full max-w-md rounded border border-white/10 bg-jarbas-surface/80 p-6 shadow-2xl shadow-black/30"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
          Acesso seguro
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-jarbas-blue">
          Jarbas
        </h1>
      </div>

      {message ? (
        <p className="mt-5 rounded border border-jarbas-cyan/30 bg-jarbas-panel px-4 py-3 text-sm text-jarbas-text">
          {message}
        </p>
      ) : null}

      <label className="mt-6 block text-sm text-jarbas-muted" htmlFor="email">
        E-mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        className="mt-2 w-full rounded border border-white/10 bg-jarbas-panel px-4 py-3 text-jarbas-text outline-none focus:border-jarbas-cyan"
        required
      />

      <label className="mt-4 block text-sm text-jarbas-muted" htmlFor="password">
        Senha
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        className="mt-2 w-full rounded border border-white/10 bg-jarbas-panel px-4 py-3 text-jarbas-text outline-none focus:border-jarbas-cyan"
        required
      />

      <button
        className="mt-6 w-full rounded bg-jarbas-cyan px-5 py-3 font-semibold text-jarbas-bg"
        type="submit"
      >
        Entrar
      </button>
    </form>
  );
}
