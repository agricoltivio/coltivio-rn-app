import { StackScreenProps } from "@/navigation/rootStackTypes";

export type WikiStackParamList = {
  WikiList: undefined;
  WikiDetail: { entryId: string };
  WikiEntryForm: { entryId?: string };
  WikiChangeRequest: { entryId: string };
  WikiChangeRequestDraft: { changeRequestId: string };
  WikiSettings: undefined;
  WikiOnboarding: undefined;
};

export type WikiListScreenProps = StackScreenProps<"WikiList">;
export type WikiDetailScreenProps = StackScreenProps<"WikiDetail">;
export type WikiEntryFormScreenProps = StackScreenProps<"WikiEntryForm">;
export type WikiChangeRequestScreenProps =
  StackScreenProps<"WikiChangeRequest">;
export type WikiChangeRequestDraftScreenProps =
  StackScreenProps<"WikiChangeRequestDraft">;
export type WikiSettingsScreenProps = StackScreenProps<"WikiSettings">;
export type WikiOnboardingScreenProps = StackScreenProps<"WikiOnboarding">;
