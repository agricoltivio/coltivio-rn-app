import { RootStackParamList } from "@/navigation/rootStackTypes";
import { Stack } from "@/navigation/stack";
import { NavigationProp } from "@react-navigation/native";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme } from "styled-components/native";
import { AddPlotMapScreen } from "../AddPlotMapScreen";
import { AddPlotSummaryScreen } from "../AddPlotSummaryScreen";
import { DeletePlotScreen } from "../DeletePlotScreen";
import { EditPlotMapScreen } from "../EditPlotMapScreen";
import { EditPlotScreen } from "../EditPlotScreen";
import { MergePlotsMapScreen } from "../MergePlotsMapScreen";
import { MergePlotSummaryScreen } from "../MergePlotSummaryScreen";
import { PlotCropProtectionApplicationsScreen } from "../PlotCropProtectionApllicationsScreen";
import { PlotDetailsScreen } from "../PlotDetailsScreen";
import { PlotFertilizerApplicationsScreen } from "../PlotFertilizerApllicationsScreen";
import { PlotHarvestsScreen } from "../PlotHarvestsScreen";
import { PlotsMapScreen } from "../PlotsMapScreen";
import { PlotTillagesScreen } from "../PlotTillagesScreen";
import { SplitPlotMapScreen } from "../SplitPlotMapScreen";
import { AddPlotOnboardingScreen } from "../AddPlotOnboardingScreen";
import { EditPlotOnboardingScreen } from "../EditPlotOnboardingScreen";
import { MergePlotsOnboardingScreen } from "../MergePlotsOnboardingScreen";
import { PlotsMapOnboardingScreen } from "../PlotsMapOnboardingScreen";
import { SplitPlotOnboardingScreen } from "../SplitPlotOnboardingScreen";
import { SplitPlotSummaryScreen } from "../SplitPlotSummaryScreen";
import { PlotListScreen } from "../map/PlotListScreen";

const closeHeaderRight = (
  theme: DefaultTheme,
  navigation: Omit<NavigationProp<RootStackParamList>, "getState">,
) => () => (
  <Pressable
    style={{ justifyContent: "center", alignItems: "center", bottom: 2 }}
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="close" size={40} color={theme.colors.primary} />
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
      key="add-plot-map"
      name="AddPlotMap"
      component={AddPlotMapScreen}
      options={{ headerShown: false, animation: "fade" }}
    />,
    <Stack.Screen
      key="edit-plot-map"
      name="EditPlotMap"
      component={EditPlotMapScreen}
      options={{ headerShown: false, animation: "fade" }}
    />,
    <Stack.Screen
      key="split-plot-map"
      name="SplitPlotMap"
      component={SplitPlotMapScreen}
      options={{ headerShown: false, animation: "fade" }}
    />,
    <Stack.Screen
      key="merge-plots-map"
      name="MergePlotsMap"
      component={MergePlotsMapScreen}
      options={{ headerShown: false, animation: "fade" }}
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
      key="plots-map-onboarding"
      name="PlotsMapOnboarding"
      component={PlotsMapOnboardingScreen}
      options={{ headerShown: false }}
    />,
    <Stack.Screen
      key="add-plot-onboarding"
      name="AddPlotOnboarding"
      component={AddPlotOnboardingScreen}
      options={{ headerShown: false }}
    />,
    <Stack.Screen
      key="edit-plot-onboarding"
      name="EditPlotOnboarding"
      component={EditPlotOnboardingScreen}
      options={{ headerShown: false }}
    />,
    <Stack.Screen
      key="split-plot-onboarding"
      name="SplitPlotOnboarding"
      component={SplitPlotOnboardingScreen}
      options={{ headerShown: false }}
    />,
    <Stack.Screen
      key="merge-plots-onboarding"
      name="MergePlotsOnboarding"
      component={MergePlotsOnboardingScreen}
      options={{ headerShown: false }}
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
  ];
}
