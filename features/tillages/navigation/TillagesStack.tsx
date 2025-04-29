import { Stack } from "@/navigation/stack";
import { AddTillageAdditionalNotesScreen } from "../add/AddTillageAdditionalNotesScreen";
import { AddTillageSelectDateScreen } from "../add/AddTillageSelectDateScreen";
import { AddTillageSelectEquipmentScreen } from "../add/AddTillageSelectEquipmentScreen";
import { AddTillageSelectPlotsScreen } from "../add/AddTillageSelectPlotsScreen";
import { AddTillageSummaryScreen } from "../add/AddTillageSummaryScreen";
import { TillageDetailsScreen } from "../TillageDetails";
import { TillagesOfYearListScreen } from "../TillagesOfYearListScreen";
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
      key="tillages-of-year-list"
      name="TillagesOfYearList"
      options={{
        title: "",
      }}
      component={TillagesOfYearListScreen}
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
      key="add-tillage-select-date"
      name="AddTillageSelectDate"
      options={{
        title: "",
      }}
      component={AddTillageSelectDateScreen}
    />,
    <Stack.Screen
      key="add-tillage-select-equipment"
      name="AddTillageSelectEquipment"
      options={{
        title: "",
      }}
      component={AddTillageSelectEquipmentScreen}
    />,
    <Stack.Screen
      key="add-tillage-select-plots"
      name="AddTillageSelectPlots"
      options={{
        title: "",
        headerShown: false,
      }}
      component={AddTillageSelectPlotsScreen}
    />,
    <Stack.Screen
      key="add-tillage-additional-notes"
      name="AddTillageAdditionalNotes"
      options={{
        title: "",
      }}
      component={AddTillageAdditionalNotesScreen}
    />,
    <Stack.Screen
      key="add-tillage-summary"
      name="AddTillageSummary"
      options={{
        title: "",
      }}
      component={AddTillageSummaryScreen}
    />,
  ];
}
