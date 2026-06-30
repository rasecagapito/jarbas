import type { PortalFlow, PortalGroup } from "@/lib/portal/types";

type AgentPanelProps = {
  groups?: PortalGroup[];
  activeGroupId?: string | null;
  flows?: PortalFlow[];
  onActiveGroupChange?: (groupId: string) => void;
};

const DEFAULT_AGENTS = [
  {
    name: "Operador Portal de Cargas",
    description: "Lista, inicia e acompanha fluxos do portal externo.",
  },
  {
    name: "Consultor SAP B1",
    description: "Tira duvidas SAP B1 em modo somente leitura.",
  },
  {
    name: "Carga PN Excel",
    description: "Fluxo legado de Parceiro de Negocio via Excel.",
  },
];

export function AgentPanel({
  groups = [],
  activeGroupId = null,
  flows = [],
  onActiveGroupChange,
}: AgentPanelProps) {
  const activeGroup =
    groups.find((group) => group.id === activeGroupId) ?? groups[0] ?? null;
  const visibleFlows = flows.filter((flow) =>
    activeGroup ? flow.groupId === activeGroup.id : true,
  );

  return (
    <aside className="jarbas-glass h-fit rounded-lg p-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
        Grupo {activeGroup?.name ?? "Solucoes"}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-jarbas-blue">
        Agentes Permitidos
      </h2>

      {groups.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => {
            const selected = group.id === activeGroup?.id;

            return (
              <button
                key={group.id}
                className={`rounded border px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] transition ${
                  selected
                    ? "border-jarbas-cyan/60 bg-jarbas-cyan/10 text-jarbas-cyan"
                    : "border-white/10 text-jarbas-muted hover:border-jarbas-cyan/40 hover:text-jarbas-cyan"
                }`}
                onClick={() => onActiveGroupChange?.(group.id)}
                type="button"
              >
                {group.name}
              </button>
            );
          })}
        </div>
      ) : null}

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

      <div className="mt-5 space-y-3">
        {DEFAULT_AGENTS.map((agent) => (
          <div key={agent.name} className="jarbas-luminous-panel rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-jarbas-text">{agent.name}</p>
                <p className="mt-2 text-sm leading-6 text-jarbas-muted">
                  {agent.description}
                </p>
              </div>
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-jarbas-cyan shadow-[0_0_16px_rgba(0,219,233,0.9)]" />
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-jarbas-cyan/50 to-transparent" />
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-jarbas-muted">
              Autorizado
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-white/10 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-jarbas-cyan">
          Fluxos do grupo
        </p>
        <div className="mt-3 space-y-3">
          {visibleFlows.length > 0 ? (
            visibleFlows.map((flow) => (
              <div key={`${flow.groupId}-${flow.id}`}>
                <p className="text-sm font-semibold text-jarbas-text">
                  {flow.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-jarbas-muted">
                  {flow.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-5 text-jarbas-muted">
              Aguardando fluxos autorizados.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
