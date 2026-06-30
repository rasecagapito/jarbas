export type JarbasAgent = {
  slug: "operador-portal-cargas" | "consultor-sap-b1" | "carga-pn-excel";
  name: string;
  workflowId: string;
  groupSlug: "solucoes";
};

export const JARBAS_AGENTS: JarbasAgent[] = [
  {
    slug: "operador-portal-cargas",
    name: "Operador Portal de Cargas",
    workflowId: "contract-portal-adapter",
    groupSlug: "solucoes",
  },
  {
    slug: "consultor-sap-b1",
    name: "Consultor SAP B1",
    workflowId: "sap-b1-readonly-consultant",
    groupSlug: "solucoes",
  },
  {
    slug: "carga-pn-excel",
    name: "Carga PN Excel",
    workflowId: "AfhcrI8P35wY0SV7",
    groupSlug: "solucoes",
  },
];
