import { StackScreenProps } from "@/navigation/rootStackTypes";

export type SeedStackParamList = {
  Seeds: undefined;
  // cropId: a crop just created from the seed form, preselected there
  CreateSeed: { cropId?: string } | undefined;
  EditSeed: { seedId: string };
};

export type SeedsScreenProps = StackScreenProps<"Seeds">;

export type CreateSeedScreenProps = StackScreenProps<"CreateSeed">;

export type EditSeedScreenProps = StackScreenProps<"EditSeed">;
