import { getAllowedReadOnlyEntities, isReadOnlyEntityAllowed } from "@/lib/sap/service-layer";
import type { SapAskResponse, SapConsultantQuestion } from "@/lib/sap/types";

const READ_ONLY_WARNING =
  "O worker SAP B1 v1 e somente leitura e nao executa escrita no SAP.";

const SAP_SOURCES = ["SAP Business One Service Layer read-only policy"];

const WRITE_INTENT_PATTERNS = [
  /\bcriar\b/i,
  /\bcrie\b/i,
  /\bcadastrar\b/i,
  /\balterar\b/i,
  /\batualizar\b/i,
  /\bdeletar\b/i,
  /\bexcluir\b/i,
  /\bcancelar\b/i,
  /\blancar\b/i,
  /\bpostar\b/i,
  /\bgravar\b/i,
];

function hasWriteIntent(question: string) {
  return WRITE_INTENT_PATTERNS.some((pattern) => pattern.test(question));
}

function inferObjectType(question: string, objectType: string | undefined) {
  if (objectType) return objectType;
  if (/parceiro|pn|business partner/i.test(question)) return "BusinessPartners";
  if (/item|estoque|produto/i.test(question)) return "Items";
  if (/pedido de venda|ordem de venda|sales order/i.test(question)) return "Orders";
  if (/nota fiscal|invoice/i.test(question)) return "Invoices";

  return "BusinessPartners";
}

function createBlockedGroupResponse(groupId: string): SapAskResponse {
  return {
    answer:
      "Nao posso responder com dados operacionais porque o grupo solicitado nao esta no contexto permitido do usuario.",
    sources: SAP_SOURCES,
    usedLiveLookup: false,
    groupScope: {
      groupId,
      allowed: false,
    },
    warnings: ["O grupo solicitado nao pertence ao contexto autorizado."],
  };
}

function createWriteBlockedResponse({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}): SapAskResponse {
  return {
    answer:
      "Posso orientar a consulta e explicar o processo, mas este worker SAP B1 esta em modo somente leitura e nao executa criacao, alteracao, cancelamento ou gravacao no SAP.",
    sources: SAP_SOURCES,
    usedLiveLookup: false,
    groupScope: {
      groupId,
      groupName,
      allowed: true,
    },
    warnings: [READ_ONLY_WARNING],
  };
}

export async function answerSapQuestion({
  question,
  groupId,
  groups,
  context,
}: SapConsultantQuestion): Promise<SapAskResponse> {
  const group = groups.find((candidate) => candidate.id === groupId);

  if (!group) {
    return createBlockedGroupResponse(groupId);
  }

  if (hasWriteIntent(question)) {
    return createWriteBlockedResponse({
      groupId: group.id,
      groupName: group.name,
    });
  }

  const objectType = inferObjectType(question, context?.objectType);
  const warnings: string[] = [];

  if (!isReadOnlyEntityAllowed(objectType)) {
    warnings.push(
      `Objeto ${objectType} ainda nao esta na allowlist read-only do worker SAP B1.`,
    );
  }

  if (context?.identifier) {
    warnings.push(
      "Consulta live ainda nao foi executada nesta v1; use o identificador apenas como contexto da pergunta.",
    );
  }

  const allowedEntities = getAllowedReadOnlyEntities().join(", ");
  const answer = [
    `Dentro do grupo ${group.name}, trate esta pergunta como consulta SAP B1 read-only.`,
    `Objeto sugerido: ${objectType}.`,
    "Para Service Layer, a consulta deve acontecer somente no backend, com sessao autenticada e sem expor credenciais ao frontend.",
    `Entidades read-only liberadas nesta v1: ${allowedEntities}.`,
    "Se precisar de dados vivos, o proximo passo e configurar credenciais Service Layer do ambiente e uma allowlist de campos por grupo.",
  ].join(" ");

  return {
    answer,
    sources: SAP_SOURCES,
    usedLiveLookup: false,
    groupScope: {
      groupId: group.id,
      groupName: group.name,
      allowed: true,
    },
    warnings,
  };
}
