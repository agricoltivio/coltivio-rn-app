import { StackScreenProps } from "@/navigation/rootStackTypes";

export type WikiStackParamList = {
  WikiList: undefined;
  WikiDetail: { entryId: string };
  WikiEntryForm: { entryId?: string };
  WikiOnboarding: undefined;
};

export type WikiListScreenProps = StackScreenProps<"WikiList">;
export type WikiDetailScreenProps = StackScreenProps<"WikiDetail">;
export type WikiEntryFormScreenProps = StackScreenProps<"WikiEntryForm">;
export type WikiOnboardingScreenProps = StackScreenProps<"WikiOnboarding">;
