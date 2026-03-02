import { RootStackParamList } from "@/navigation/rootStackTypes";
import { Stack } from "@/navigation/stack";
import { NavigationProp } from "@react-navigation/native";
import { Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme } from "styled-components/native";
import { AddPlotSummaryScreen } from "../AddPlotSummaryScreen";
import { DeletePlotScreen } from "../DeletePlotScreen";
import { EditPlotScreen } from "../EditPlotScreen";
import { MergePlotSummaryScreen } from "../MergePlotSummaryScreen";
import { PlotCropProtectionApplicationsScreen } from "../PlotCropProtectionApllicationsScreen";
import { PlotDetailsScreen } from "../PlotDetailsScreen";
import { PlotFertilizerApplicationsScreen } from "../PlotFertilizerApllicationsScreen";
import { PlotHarvestsScreen } from "../PlotHarvestsScreen";
import { PlotsMapScreen } from "../map/PlotsMapScreen";
import { PlotTillagesScreen } from "../PlotTillagesScreen";
import { PlotsMapOnboardingScreen } from "../PlotsMapOnboardingScreen";
import { SplitPlotOnboardingScreen } from "../SplitPlotOnboardingScreen";
import { MergePlotsOnboardingScreen } from "../MergePlotsOnboardingScreen";
import { AdjustPlotOnboardingScreen } from "../AdjustPlotOnboardingScreen";
import { SplitPlotSummaryScreen } from "../SplitPlotSummaryScreen";
import { PlotListScreen } from "../map/PlotListScreen";

const closeHeaderRight = (
  theme: DefaultTheme,
  navigation: Omit<NavigationProp<RootStackParamList>, "getState">,
) => () => (
  <Pressable
    style={{
      paddingHorizontal: 8,
      paddingTop: Platform.OS === "android" ? theme.spacing.m : 4,
      paddingBottom: 4,
    }}
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="close" size={28} color={theme.colors.primary} />
  </Pressable>
);

export function renderPlotsStack(
  theme: DefaultTheme,
  navigation: Omit<NavigationProp<RootStackParamList>, "getState">,
) {
  const headerRight = closeHeaderRight(theme, navigation);

  return [
    <Stack.Screen
      key="plots-map"
      name="PlotsMap"
      component={PlotsMapScreen}
      options={{ headerShown: false }}
    />,
    <Stack.Screen
      key="add-plot-summary"
      name="AddPlotSummary"
      component={AddPlotSummaryScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: true,
        headerRight,
      }}
    />,
    <Stack.Screen
      key="edit-plot"
      name="EditPlot"
      component={EditPlotScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: true,
        headerRight,
      }}
    />,
    <Stack.Screen
      key="edit-plot-modal"
      name="EditPlotModal"
      component={EditPlotScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: true,
        headerRight,
      }}
    />,
    <Stack.Screen
      key="delete-plot"
      name="DeletePlot"
      component={DeletePlotScreen}
      options={{ title: "" }}
    />,
    <Stack.Screen
      key="plot-details"
      name="PlotDetails"
      options={{ title: "" }}
      component={PlotDetailsScreen}
    />,
    <Stack.Screen
      key="plot-harvests"
      name="PlotHarvests"
      options={{ title: "" }}
      component={PlotHarvestsScreen}
    />,
    <Stack.Screen
      key="plot-fertilizer-applications"
      name="PlotFertilizerApplications"
      options={{ title: "" }}
      component={PlotFertilizerApplicationsScreen}
    />,
    <Stack.Screen
      key="plot-crop-protection-applications"
      name="PlotCropProtectionApplications"
      options={{ title: "" }}
      component={PlotCropProtectionApplicationsScreen}
    />,
    <Stack.Screen
      key="plot-tillages"
      name="PlotTillages"
      options={{ title: "" }}
      component={PlotTillagesScreen}
    />,
    <Stack.Screen
      key="split-plot-summary"
      name="SplitPlotSummary"
      component={SplitPlotSummaryScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: true,
        headerRight,
      }}
    />,
    <Stack.Screen
      key="merge-plot-summary"
      name="MergePlotSummary"
      component={MergePlotSummaryScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: true,
        headerRight,
      }}
    />,
    <Stack.Screen
      key="plot-list"
      name="PlotList"
      component={PlotListScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: true,
        headerRight,
      }}
    />,
    <Stack.Screen
      key="plots-map-onboarding"
      name="PlotsMapOnboarding"
      component={PlotsMapOnboardingScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: false,
      }}
    />,
    <Stack.Screen
      key="split-plot-onboarding"
      name="SplitPlotOnboarding"
      component={SplitPlotOnboardingScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: false,
      }}
    />,
    <Stack.Screen
      key="merge-plots-onboarding"
      name="MergePlotsOnboarding"
      component={MergePlotsOnboardingScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: false,
      }}
    />,
    <Stack.Screen
      key="adjust-plot-onboarding"
      name="AdjustPlotOnboarding"
      component={AdjustPlotOnboardingScreen}
      options={{
        title: "",
        presentation: "modal",
        headerShown: false,
      }}
    />,
  ];
}
