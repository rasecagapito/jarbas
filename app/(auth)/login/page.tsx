import { LoginForm } from "@/components/auth/login-form";
import { getLoginMessageFromCode } from "@/lib/auth/login";

const navItems = ["Cluster", "Workflows", "Logs"];
const featureItems = [
  { icon: "◇", label: "Criptografia", value: "Grau Empresarial" },
  { icon: "✤", label: "Validação", value: "Sinc. Neural" },
  { icon: "↯", label: "Sincronismo", value: "99,9% Uptime" },
];
const fibers = Array.from({ length: 22 }, (_, index) => index + 1);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="jarbas-login-shell relative min-h-screen overflow-hidden text-jarbas-text">
      <div className="jarbas-neural-bg" aria-hidden="true">
        {fibers.map((fiber) => (
          <span className={`jarbas-fiber jarbas-fiber-${fiber}`} key={fiber} />
        ))}
      </div>

      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-jarbas-surface/50 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-8 lg:px-11 xl:px-[132px]">
          <a className="flex min-w-0 items-center gap-3" href="#">
            <span className="jarbas-orchestrator-mark" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-black text-jarbas-text">
                Jarbas / S.A.M.
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.38em] text-jarbas-text/80 sm:block">
                Secure Automated Multi-Agent
              </span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-9 font-display text-base font-bold text-jarbas-text/90 lg:flex"
            aria-label="Navegação visual"
          >
            {navItems.map((item) => (
              <a
                className="transition hover:text-jarbas-cyan"
                href="#"
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              className="hidden font-display text-base font-bold text-jarbas-text/90 transition hover:text-jarbas-cyan sm:inline"
              href="#"
            >
              Entrar
            </a>
            <a
              className="jarbas-dark-pill hidden px-7 py-3 font-display text-base font-bold sm:inline-flex"
              href="#"
            >
              Começar
            </a>
          </div>
        </div>
      </header>

      <section className="relative z-10 grid min-h-screen w-full items-center gap-10 px-4 pb-12 pt-28 sm:px-8 lg:grid-cols-[minmax(0,51vw)_482px_minmax(0,1fr)] lg:px-11 lg:pt-28 xl:gap-16">
        <div className="order-2 min-w-0 space-y-12 lg:order-1">
          <div className="max-w-[650px] space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-jarbas-cyan/20 bg-jarbas-panel/55 px-4 py-2 font-display text-lg text-jarbas-text backdrop-blur-xl">
              <span className="text-jarbas-cyan">✣</span>
              A PRÓXIMA GERAÇÃO CHEGOU
            </div>

            <div className="space-y-7">
              <h1 className="font-display text-lg font-medium leading-relaxed text-jarbas-text sm:text-xl">
                Acesso Neural Seguro ao{" "}
                <span className="text-jarbas-cyan">futuro.</span>
              </h1>
              <p className="max-w-[580px] font-display text-lg leading-8 text-jarbas-text/95">
                Orquestrando nós descentralizados com criptografia quântica e
                gerenciamento de agentes de IA de alta fidelidade. Preciso,
                cerebral e soberano.
              </p>
            </div>

            <div className="flex flex-wrap gap-5 pt-5">
              <a
                className="jarbas-dark-button inline-flex items-center gap-3 px-9 py-5"
                href="#"
              >
                Começar
                <span aria-hidden="true">→</span>
              </a>
              <a
                className="jarbas-outline-button inline-flex items-center px-9 py-5"
                href="#"
              >
                Documentação
              </a>
            </div>
          </div>

          <div className="grid max-w-[700px] gap-8 sm:grid-cols-3">
            {featureItems.map((item) => (
              <div className="space-y-3" key={item.label}>
                <div className="flex items-center gap-3 font-display text-lg uppercase text-jarbas-text/90">
                  <span className="text-jarbas-text/90">{item.icon}</span>
                  {item.label}
                </div>
                <p className="font-display text-xl text-jarbas-text">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 flex w-full min-w-0 justify-center lg:order-2 lg:justify-start">
          <LoginForm message={getLoginMessageFromCode(message)} />
        </div>
      </section>
    </main>
  );
}
