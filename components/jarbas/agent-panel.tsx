export function AgentPanel() {
  return (
    <aside className="border border-white/10 bg-jarbas-surface/70 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
        Grupo Solucoes
      </p>
      <h2 className="mt-3 font-display text-xl font-semibold text-jarbas-blue">
        Agentes Permitidos
      </h2>

      <div className="mt-5 border border-jarbas-cyan/30 bg-jarbas-panel p-4">
        <p className="font-semibold text-jarbas-text">Carga PN Excel</p>
        <p className="mt-2 text-sm leading-6 text-jarbas-muted">
          Carga de Parceiro de Negocio via Excel padrao.
        </p>
      </div>
    </aside>
  );
}
