import { LoginForm } from "@/components/auth/login-form";
import { getLoginMessageFromCode } from "@/lib/auth/login";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="jarbas-circuit relative min-h-screen overflow-hidden px-4 py-6 text-jarbas-text sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="jarbas-scanline absolute inset-x-0 top-0 h-1/2" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-jarbas-cyan/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 bg-jarbas-surface/40 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
            Assistente Jarbas
          </p>
          <p className="mt-1 text-sm text-jarbas-muted">S.A.M. Secure Access</p>
        </div>
        <div className="hidden items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-jarbas-muted sm:flex">
          <span className="h-2 w-2 rounded-full bg-jarbas-cyan shadow-[0_0_18px_rgba(0,219,233,0.9)]" />
          Homologacao
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6.5rem)] max-w-7xl items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="hidden min-h-[520px] items-center justify-center lg:flex">
          <div className="jarbas-float relative flex h-[440px] w-[440px] items-center justify-center">
            <div className="jarbas-ring absolute inset-0 rounded-full border border-jarbas-cyan/15" />
            <div className="jarbas-ring-slow absolute inset-10 rounded-full border border-jarbas-blue/20" />
            <div className="absolute inset-20 rounded-full border border-white/10 bg-jarbas-bg/30 backdrop-blur-sm" />
            <video
              aria-hidden="true"
              autoPlay
              className="jarbas-core-shadow relative h-[310px] w-[310px] rounded-full object-cover opacity-90 mix-blend-screen"
              loop
              muted
              playsInline
            >
              <source
                src="https://res.cloudinary.com/dswwqkues/video/upload/v1782399147/jarbas_sem_fundo_transparente_anmayy.webm"
                type="video/webm"
              />
            </video>
            <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-jarbas-cyan/50" />
            <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-jarbas-cyan/50" />
            <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-jarbas-cyan/50" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-jarbas-cyan/50" />
          </div>
        </div>

        <LoginForm message={getLoginMessageFromCode(message)} />
      </section>
    </main>
  );
}
