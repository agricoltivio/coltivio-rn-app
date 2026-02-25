import { StackScreenProps } from "@/navigation/rootStackTypes";

export type HomeStackParamList = {
  Home: undefined;
  SpeedDialOnboarding: undefined;
};

export type HomeScreenProps = StackScreenProps<"Home">;
export type SpeedDialOnboardingScreenProps = StackScreenProps<"SpeedDialOnboarding">;
