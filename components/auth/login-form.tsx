import { signIn } from "@/app/(auth)/login/actions";

export function LoginForm({ message }: { message: string | null }) {
  return (
    <div className="jarbas-login-card jarbas-glass-active relative overflow-hidden p-9 sm:p-10">
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-medium text-jarbas-text">
          Bem-vindo de volta
        </h2>
        <p className="text-lg leading-7 text-jarbas-text/90">
          Entre para acessar o núcleo do orquestrador
        </p>
      </div>

      <form action={signIn} className="mt-9 space-y-7">
        {message ? (
          <p className="rounded-xl border border-jarbas-cyan/35 bg-jarbas-panel/80 px-4 py-3 text-sm text-jarbas-text shadow-[0_0_24px_rgba(0,219,233,0.12)]">
            {message}
          </p>
        ) : null}

        <div className="space-y-3">
          <label
            className="block font-display text-lg uppercase text-jarbas-text"
            htmlFor="email"
          >
            ID Neural
          </label>
          <div className="jarbas-field-shell">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="jarbas-field pr-12"
              placeholder="vladderkach@mail.com"
              required
            />
            <span className="jarbas-field-icon" aria-hidden="true">
              @
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <label
              className="block font-display text-lg uppercase text-jarbas-text"
              htmlFor="password"
            >
              Cifra de Acesso
            </label>
            <a
              className="text-lg text-jarbas-text/90 transition hover:text-jarbas-cyan"
              href="#"
            >
              Redefinir Cifra?
            </a>
          </div>
          <div className="jarbas-field-shell">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="jarbas-field pr-12"
              placeholder="••••••••••••"
              required
            />
            <span className="jarbas-field-icon" aria-hidden="true">
              ◉
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            className="h-4 w-4 rounded-sm border border-white/70 bg-white text-jarbas-cyan accent-white"
            id="remember"
            name="remember"
            type="checkbox"
          />
          <label
            className="cursor-pointer text-lg text-jarbas-text/90"
            htmlFor="remember"
          >
            Lembrar acesso ao nó
          </label>
        </div>

        <button
          className="jarbas-auth-button flex w-full items-center justify-center gap-3 px-5 py-5"
          type="submit"
        >
          Autorizar Sessão
          <span aria-hidden="true">⚿</span>
        </button>
      </form>

      <div className="relative py-11">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/70" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-jarbas-bg px-5 font-display text-xl uppercase tracking-[0.18em] text-jarbas-text">
            ou conecte via
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <button className="jarbas-ghost-button" type="button">
          <span className="font-display text-base font-bold text-jarbas-text">
            G
          </span>
          Google
        </button>
        <button className="jarbas-ghost-button" type="button">
          <span className="text-jarbas-text" aria-hidden="true">
            ◆
          </span>
          X / Core
        </button>
      </div>

      <p className="mt-7 text-center text-base text-jarbas-text/90">
        Precisa de acesso?{" "}
        <a className="font-bold text-jarbas-text hover:text-jarbas-cyan" href="#">
          Solicitar convite
        </a>
      </p>
    </div>
  );
}
