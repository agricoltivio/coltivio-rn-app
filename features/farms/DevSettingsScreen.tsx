import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Switch } from "@/components/inputs/Switch";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { H2 } from "@/theme/Typography";
import { useState } from "react";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import {
  defaultLocalSettings,
  useLocalSettings,
} from "../user/LocalSettingsContext";

// Resettable local settings, grouped by topic: resetting a group resets every
// tutorial flag of that topic (e.g. all map tutorials, including the meadow ones)
const RESET_GROUPS = [
  {
    id: "map",
    label: "Map & plots tutorials",
    keys: [
      "plotsMapOnboardingCompleted",
      "mapDrawOnboardingCompleted",
      "addPlotDrawOnboardingCompleted",
      "addPlotParcelOnboardingCompleted",
      "addMeadowDrawOnboardingCompleted",
      "addMeadowPlotsOnboardingCompleted",
      "editPlotOnboardingCompleted",
      "splitPlotOnboardingCompleted",
      "mergePlotsOnboardingCompleted",
    ],
  },
  {
    id: "fieldCalendar",
    label: "Field calendar tutorials",
    keys: [
      "fieldCalendarOnboardingCompleted",
      "selectPlotsForPlanOnboardingCompleted",
    ],
  },
  {
    id: "animals",
    label: "Animals tutorials",
    keys: [
      "animalsOnboardingCompleted",
      "herdsOnboardingCompleted",
      "tvdImportOnboardingCompleted",
    ],
  },
  {
    id: "tasks",
    label: "Tasks tutorial & push prompt",
    keys: ["tasksOnboardingCompleted", "taskPushNotificationsPromptCompleted"],
  },
  {
    id: "home",
    label: "Home tutorials",
    keys: ["speedDialOnboardingCompleted"],
  },
  { id: "wiki", label: "Wiki tutorial", keys: ["wikiOnboardingCompleted"] },
  // Not tutorials: the section tile layouts and the "skip all tutorials" switch
  {
    id: "sectionLayouts",
    label: "Field calendar & animals layouts",
    keys: ["fieldCalendarGroups", "animalsGroups"],
  },
  {
    id: "onboardingsDisabled",
    label: "Onboardings disabled",
    keys: ["onboardingsDisabled"],
  },
] as const;

type ResetGroupId = (typeof RESET_GROUPS)[number]["id"];

export function DevSettingsScreen() {
  const theme = useTheme();
  const { updateLocalSettings } = useLocalSettings();
  const [selected, setSelected] = useState<Set<ResetGroupId>>(new Set());

  function toggle(groupId: ResetGroupId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(RESET_GROUPS.map((group) => group.id)));
  }

  function resetSelected() {
    if (selected.size === 0) return;

    Alert.alert(
      "Reset Settings",
      `Reset ${selected.size} selected group(s) to defaults?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // Reset every key of the selected groups to its default value;
            // this also persists each change to AsyncStorage
            for (const group of RESET_GROUPS) {
              if (!selected.has(group.id)) continue;
              for (const key of group.keys) {
                updateLocalSettings(key, defaultLocalSettings[key]);
              }
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
            title={`Reset ${selected.size} group(s)`}
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
          type="primary"
          onPress={selectAll}
          style={{ marginTop: theme.spacing.m }}
        />

        {RESET_GROUPS.map(({ id, label }) => (
          <Switch
            key={id}
            label={label}
            value={selected.has(id)}
            onChange={() => toggle(id)}
            style={{ paddingVertical: theme.spacing.s }}
          />
        ))}
      </ScrollView>
    </ContentView>
  );
}
