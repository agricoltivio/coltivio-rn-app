import { Stack } from "@/navigation/stack";
import { SelectTillageDateScreen } from "../add/SelectTillageDateScreen";
import { ConfigureTillageScreen } from "../add/ConfigureTillageScreen";
import { SelectTillagePlotsScreen } from "../add/SelectTillagePlotsScreen";
import { TillageSummaryScreen } from "../add/TillageSummaryScreen";
import { TillageDetailsScreen } from "../TillageDetails";
import { TillagesScreen } from "../TillagesScreen";

export function renderTillagesStack() {
  return [
    <Stack.Screen
      key="tillages"
      name="Tillages"
      options={{
        title: "",
      }}
      component={TillagesScreen}
    />,
<Stack.Screen
      key="tillage-details"
      name="TillageDetails"
      options={{
        title: "",
      }}
      component={TillageDetailsScreen}
    />,
    <Stack.Screen
      key="select-tillage-date"
      name="SelectTillageDate"
      options={{
        title: "",
      }}
      component={SelectTillageDateScreen}
    />,
    <Stack.Screen
      key="configure-tillage"
      name="ConfigureTillage"
      options={{
        title: "",
      }}
      component={ConfigureTillageScreen}
    />,
    <Stack.Screen
      key="select-tillage-plots"
      name="SelectTillagePlots"
      options={{
        title: "",
        headerShown: false,
      }}
      component={SelectTillagePlotsScreen}
    />,
    <Stack.Screen
      key="tillage-summary"
      name="TillageSummary"
      options={{
        title: "",
      }}
      component={TillageSummaryScreen}
    />,
  ];
}
