import { StackScreenProps } from "@/navigation/rootStackTypes";

export type SowingReturnTo = "PlotsMap" | "PlotDetails" | "PlotSowings";

export type SowingStackParamList = {
  Sowings: undefined;
  SowingDetails: { sowingId: string };
  EditSowing: { sowingId: string };
  SelectSowingSeedAndDate:
    | {
        seedId?: string;
        cropId?: string;
        plotId?: string;
        name?: string;
        returnTo?: SowingReturnTo;
      }
    | undefined;
  SelectSowingPlots: undefined;
  ConfigureSowing: undefined;
  DivideSowingOnPlots: undefined;
  SowingSummary: undefined;
};

export type SowingsScreenProps = StackScreenProps<"Sowings">;

export type SowingDetailsScreenProps = StackScreenProps<"SowingDetails">;

export type EditSowingScreenProps = StackScreenProps<"EditSowing">;

export type SelectSowingSeedAndDateScreenProps =
  StackScreenProps<"SelectSowingSeedAndDate">;

export type SelectSowingPlotsScreenProps =
  StackScreenProps<"SelectSowingPlots">;

export type ConfigureSowingScreenProps = StackScreenProps<"ConfigureSowing">;

export type DivideSowingOnPlotsScreenProps =
  StackScreenProps<"DivideSowingOnPlots">;

export type SowingSummaryScreenProps = StackScreenProps<"SowingSummary">;
