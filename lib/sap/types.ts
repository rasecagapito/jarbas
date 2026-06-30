import type { PortalGroup } from "@/lib/portal/types";

export type SapAskRequest = {
  question: string;
  groupId: string;
  context?: {
    objectType?: string;
    identifier?: string;
  };
};

export type SapGroupScope =
  | {
      groupId: string;
      groupName: string;
      allowed: true;
    }
  | {
      groupId: string;
      allowed: false;
    };

export type SapAskResponse = {
  answer: string;
  sources: string[];
  usedLiveLookup: boolean;
  groupScope: SapGroupScope;
  warnings: string[];
};

export type SapConsultantQuestion = SapAskRequest & {
  groups: PortalGroup[];
};
