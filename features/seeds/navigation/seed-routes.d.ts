import { StackScreenProps } from "@/navigation/rootStackTypes";

export type SeedStackParamList = {
  Seeds: undefined;
  CreateSeed: undefined;
  EditSeed: { seedId: string };
};

export type SeedsScreenProps = StackScreenProps<"Seeds">;

export type CreateSeedScreenProps = StackScreenProps<"CreateSeed">;

export type EditSeedScreenProps = StackScreenProps<"EditSeed">;
