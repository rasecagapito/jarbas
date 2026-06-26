export function AgentPanel() {
  return (
    <aside className="jarbas-glass h-fit rounded-lg p-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
        Grupo Solucoes
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-jarbas-blue">
        Agentes Permitidos
      </h2>

      <div className="mt-6 grid grid-cols-3 gap-2 font-mono text-xs uppercase tracking-[0.12em] text-jarbas-muted">
        <span className="rounded border border-jarbas-cyan/40 bg-jarbas-cyan/10 px-2 py-2 text-center text-jarbas-cyan">
          Cluster
        </span>
        <span className="rounded border border-white/10 px-2 py-2 text-center">
          Fluxos
        </span>
        <span className="rounded border border-white/10 px-2 py-2 text-center">
          Logs
        </span>
      </div>

      <div className="jarbas-luminous-panel mt-5 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-jarbas-text">Carga PN Excel</p>
            <p className="mt-2 text-sm leading-6 text-jarbas-muted">
              Parceiro de Negocio via Excel padrao.
            </p>
          </div>
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-jarbas-cyan shadow-[0_0_16px_rgba(0,219,233,0.9)]" />
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-jarbas-cyan/50 to-transparent" />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-jarbas-muted">
          Autorizado
        </p>
      </div>
    </aside>
  );
}
