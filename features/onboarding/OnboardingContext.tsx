import { CropCreateInput } from "@/api/crops.api";
import { FertilizerCreateInput } from "@/api/fertilizers.api";
import { FederalFarmPlot } from "@/api/layers.api";
import { PlotCreateInput } from "@/api/plots.api";
import { createContext, useContext, useState } from "react";

export interface OnboardingData {
  name: string;
  location: { label: string; lat: number; lng: number } | null;
  federalFarmId: string | null;
  parcelsById: Record<string, FederalFarmPlot>;
  createParcelPlots: boolean;
  customPlots: PlotCreateInput[];
  fertilizers: FertilizerCreateInput[];
  crops: CropCreateInput[];
}

const OnboardingContext = createContext<{
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  clear: () => void;
} | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<OnboardingData>({
    name: "",
    location: null,
    federalFarmId: null,
    parcelsById: {},
    createParcelPlots: true,
    customPlots: [],
    fertilizers: [],
    // crops: [{ name: "Naturwiese", category: "grass" }],
    crops: [],
  });
  function clear() {
    setData({
      name: "",
      location: null,
      federalFarmId: null,
      parcelsById: {},
      createParcelPlots: true,
      customPlots: [],
      fertilizers: [],
      // crops: [{ name: "Naturwiese", category: "grass" }],
      crops: [],
    });
  }

  return (
    <OnboardingContext.Provider value={{ data, setData, clear }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
