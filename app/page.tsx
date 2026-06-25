export default function HomePage() {
  return (
    <main className="min-h-screen bg-jarbas-bg px-6 py-10 text-jarbas-text">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-jarbas-cyan">
          Jarbas MVP
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-jarbas-blue sm:text-5xl">
          Orquestrador operacional para Carga PN Excel
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-jarbas-muted">
          Fundacao inicial do Jarbas para autenticar usuarios, respeitar grupos
          de acesso e acompanhar execucoes conduzidas pelo n8n.
        </p>
      </section>
    </main>
  );
}
