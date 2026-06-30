export type PortalGroup = {
  id: string;
  name: string;
  slug: string;
};

export type PortalAgent = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type PortalFlow = {
  id: string;
  groupId: string;
  agentId: string;
  name: string;
  description: string;
  category: string;
  requiresInput: boolean;
  inputSchema: Record<string, unknown> | null;
  enabled: boolean;
};

export type PortalExecution = {
  id: string;
  groupId: string;
  flowId: string;
  flowName: string;
  status: string;
  currentStep: string;
  progressPercent: number;
  summary: Record<string, unknown>;
  createdAt: string;
};

export type StartPortalExecutionRequest = {
  flowId: string;
  groupId: string;
  input?: Record<string, unknown>;
};

export type PortalGatewayError = {
  ok: false;
  status: number;
  error: string;
};

export type StartPortalExecutionResult =
  | {
      ok: true;
      execution: PortalExecution;
    }
  | PortalGatewayError;

export type GetPortalExecutionResult =
  | {
      ok: true;
      execution: PortalExecution;
    }
  | PortalGatewayError;
