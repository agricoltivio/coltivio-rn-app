import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Switch } from "@/components/inputs/Switch";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { H2 } from "@/theme/Typography";
import { useState } from "react";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultLocalSettings, useLocalSettings } from "../user/LocalSettingsContext";

// All resettable local settings keys with human-readable labels
const RESETTABLE_KEYS = [
  { key: "fieldCalendarOnboardingCompleted", label: "Field Calendar Onboarding" },
  { key: "fieldCalendarGroups", label: "Field Calendar Groups" },
  { key: "animalsOnboardingCompleted", label: "Animals Onboarding" },
  { key: "animalsGroups", label: "Animals Groups" },
  { key: "herdsOnboardingCompleted", label: "Herds Onboarding" },
  { key: "tvdImportOnboardingCompleted", label: "TVD Import Onboarding" },
  { key: "mapDrawOnboardingCompleted", label: "Map Draw Onboarding" },
  { key: "plotsMapOnboardingCompleted", label: "Plots Map Onboarding" },
  { key: "addPlotDrawOnboardingCompleted", label: "Add Plot Draw Onboarding" },
  { key: "addPlotParcelOnboardingCompleted", label: "Add Plot Parcel Onboarding" },
  { key: "editPlotOnboardingCompleted", label: "Edit Plot Onboarding" },
  { key: "splitPlotOnboardingCompleted", label: "Split Plot Onboarding" },
  { key: "mergePlotsOnboardingCompleted", label: "Merge Plots Onboarding" },
  { key: "selectPlotsForPlanOnboardingCompleted", label: "Crop Rotation Plot Selection Onboarding" },
  { key: "speedDialOnboardingCompleted", label: "Speed Dial Onboarding" },
  { key: "wikiOnboardingCompleted", label: "Wiki Onboarding" },
  { key: "tasksOnboardingCompleted", label: "Tasks Onboarding" },
  { key: "onboardingsDisabled", label: "Onboardings Disabled" },
] as const;

type ResettableKey = (typeof RESETTABLE_KEYS)[number]["key"];

export function DevSettingsScreen() {
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const [selected, setSelected] = useState<Set<ResettableKey>>(new Set());

  function toggle(key: ResettableKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(RESETTABLE_KEYS.map((k) => k.key)));
  }

  function resetSelected() {
    if (selected.size === 0) return;

    Alert.alert(
      "Reset Settings",
      `Reset ${selected.size} selected setting(s) to defaults?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // Reset each selected key to its default value in-memory
            // This also persists each change to AsyncStorage
            for (const key of selected) {
              updateLocalSettings(key, defaultLocalSettings[key]);
            }

            setSelected(new Set());
            Alert.alert("Done", "Selected settings have been reset.");
          },
        },
      ],
    );
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="danger"
            title={`Reset ${selected.size} setting(s)`}
            onPress={resetSelected}
            disabled={selected.size === 0}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView headerTitleOnScroll="Developer Settings" showHeaderOnScroll>
        <H2>Developer Settings</H2>

        <Button
          title="Select All"
          type="secondary"
          onPress={selectAll}
          style={{ marginTop: theme.spacing.m }}
        />

        {RESETTABLE_KEYS.map(({ key, label }) => (
          <Switch
            key={key}
            label={label}
            value={selected.has(key)}
            onChange={() => toggle(key)}
            style={{ paddingVertical: theme.spacing.s }}
          />
        ))}
      </ScrollView>
    </ContentView>
  );
}
