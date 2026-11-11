import { useApi } from "@/api/api";
import { AnimalType } from "@/api/animals.api";
import { GestationSetting } from "@/api/breeding.api";
import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { NumberInput } from "@/components/inputs/NumberInput";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import {
  getNotificationPermissionAsync,
  registerPushTokenAsync,
} from "@/features/notifications/push-notifications";
import {
  BreedingReminderSettings,
  useUpdateBreedingRemindersMutation,
  useUserQuery,
} from "@/features/user/users.hooks";
import { Body, H2, H3 } from "@/theme/Typography";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useGestationSettingsQuery,
  useUpdateGestationSettingsMutation,
} from "./breeding.hooks";
import { BreedingSettingsScreenProps } from "./navigation/animals-routes";

const REMINDER_OFF = "off";
const REMINDER_DAY_OPTIONS = [0, 1, 3, 7, 14, 30];
// The API accepts 1 to 500 days
const MIN_GESTATION_DAYS = 1;
const MAX_GESTATION_DAYS = 500;

function toGestationInputs(settings: GestationSetting[]) {
  return Object.fromEntries(
    settings.map((setting) => [
      setting.animalType,
      String(setting.gestationDays),
    ]),
  );
}

// Empty resets to the default (null), anything else must be a whole number of days in range
function parseGestationInput(input: string): number | null | "invalid" {
  const trimmedInput = input.trim();
  if (trimmedInput === "") return null;
  if (!/^\d+$/.test(trimmedInput)) return "invalid";
  const gestationDays = parseInt(trimmedInput, 10);
  return gestationDays >= MIN_GESTATION_DAYS &&
    gestationDays <= MAX_GESTATION_DAYS
    ? gestationDays
    : "invalid";
}

export function BreedingSettingsScreen(_props: BreedingSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi();
  const { user } = useUserQuery();
  const isOwner = user?.farmRole === "owner";
  const { gestationSettings } = useGestationSettingsQuery();
  const updateGestationSettingsMutation = useUpdateGestationSettingsMutation();
  const updateRemindersMutation = useUpdateBreedingRemindersMutation();
  const [gestationInputs, setGestationInputs] = useState<
    Partial<Record<AnimalType, string>>
  >({});
  const [notificationPermissionDenied, setNotificationPermissionDenied] =
    useState(false);
  const [showGestationErrors, setShowGestationErrors] = useState(false);

  // Filled once from the server and again after saving, so a refetch doesn't overwrite unsaved edits
  const gestationInputsInitialized = useRef(false);
  useEffect(() => {
    if (!gestationSettings || gestationInputsInitialized.current) return;
    gestationInputsInitialized.current = true;
    setGestationInputs(toGestationInputs(gestationSettings));
  }, [gestationSettings]);

  const parsedGestationDays = new Map(
    (gestationSettings ?? []).map((setting) => [
      setting.animalType,
      parseGestationInput(gestationInputs[setting.animalType] ?? ""),
    ]),
  );
  const hasInvalidGestationInput = [...parsedGestationDays.values()].some(
    (gestationDays) => gestationDays === "invalid",
  );

  function saveGestationSettings() {
    if (!gestationSettings) return;
    if (hasInvalidGestationInput) {
      setShowGestationErrors(true);
      return;
    }
    updateGestationSettingsMutation.mutate(
      {
        settings: gestationSettings.map((setting) => {
          const parsedDays = parsedGestationDays.get(setting.animalType);
          const gestationDays =
            typeof parsedDays === "number" ? parsedDays : null;
          // An empty field resets the type to its default. An unchanged default stays a default, so
          // later changes of the default still apply and it keeps its "default" label.
          const keepsDefault =
            setting.isDefault && gestationDays === setting.gestationDays;
          return {
            animalType: setting.animalType,
            gestationDays: keepsDefault ? null : gestationDays,
          };
        }),
      },
      {
        onSuccess: (savedSettings) => {
          setShowGestationErrors(false);
          setGestationInputs(toGestationInputs(savedSettings));
          Alert.alert(t("breeding.gestation_saved"));
        },
        onError: () =>
          Alert.alert(t("common.error"), t("common.unknown_error")),
      },
    );
  }

  // Turning a reminder on asks for notification permission first, like the task reminders
  async function updateReminder(settings: BreedingReminderSettings) {
    const enabling = Object.values(settings).some((value) => value != null);
    if (!enabling) {
      updateRemindersMutation.mutate(settings);
      return;
    }
    try {
      const permission = await getNotificationPermissionAsync({
        requestPermission: true,
      });
      // Denied and blocked both need the system settings, so both show the hint
      setNotificationPermissionDenied(
        permission != null && !permission.granted,
      );
      // null: simulator/emulator without push support, the setting can still be changed
      if (permission != null && !permission.granted) {
        return;
      }
      updateRemindersMutation.mutate(settings);
      if (permission != null) {
        await registerPushTokenAsync(api.users);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const reminderOptions = [
    { label: t("breeding.reminder_off"), value: REMINDER_OFF },
    ...REMINDER_DAY_OPTIONS.map((days) => ({
      label:
        days === 0
          ? t("breeding.reminder_on_day")
          : t("breeding.reminder_days_before", { count: days }),
      value: String(days),
    })),
  ];
  const toReminderValue = (days: number | null | undefined) =>
    days == null ? REMINDER_OFF : String(days);
  const fromReminderValue = (value: string) =>
    value === REMINDER_OFF ? null : parseInt(value, 10);

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("breeding.settings_title")}
        keyboardAware
      >
        <H2>{t("breeding.settings_title")}</H2>

        <View
          style={{
            marginTop: theme.spacing.l,
            padding: theme.spacing.m,
            borderRadius: 10,
            backgroundColor: theme.colors.white,
            gap: theme.spacing.s,
          }}
        >
          <H3>{t("breeding.reminders")}</H3>
          <Body style={{ color: theme.colors.gray2 }}>
            {t("breeding.reminders_description")}
          </Body>
          <Select
            label={t("breeding.reminder_1")}
            value={toReminderValue(user?.breedingReminderDaysBefore1)}
            data={reminderOptions}
            disabled={!user}
            onChange={(value) =>
              updateReminder({
                breedingReminderDaysBefore1: fromReminderValue(value),
              })
            }
          />
          <Select
            label={t("breeding.reminder_2")}
            value={toReminderValue(user?.breedingReminderDaysBefore2)}
            data={reminderOptions}
            disabled={!user}
            onChange={(value) =>
              updateReminder({
                breedingReminderDaysBefore2: fromReminderValue(value),
              })
            }
          />
          {notificationPermissionDenied && (
            <>
              <Body style={{ color: theme.colors.gray2 }}>
                {t("breeding.permission_denied")}
              </Body>
              <Button
                title={t("settings.task_push_notifications.open_settings")}
                onPress={() => Linking.openSettings()}
              />
            </>
          )}
        </View>

        <View
          style={{
            marginTop: theme.spacing.l,
            padding: theme.spacing.m,
            borderRadius: 10,
            backgroundColor: theme.colors.white,
            gap: theme.spacing.s,
          }}
        >
          <H3>{t("breeding.gestation_days")}</H3>
          <Body style={{ color: theme.colors.gray2 }}>
            {isOwner
              ? t("breeding.gestation_description")
              : t("breeding.only_owner_can_edit")}
          </Body>
          {gestationSettings?.map((setting) => (
            <NumberInput
              key={setting.animalType}
              label={`${t(`animals.animal_types.${setting.animalType}`)}${
                setting.isDefault ? ` (${t("breeding.default")})` : ""
              }`}
              value={gestationInputs[setting.animalType] ?? ""}
              disabled={!isOwner}
              error={
                showGestationErrors &&
                parsedGestationDays.get(setting.animalType) === "invalid"
                  ? t("breeding.gestation_days_invalid")
                  : null
              }
              onChangeText={(value) =>
                setGestationInputs((inputs) => ({
                  ...inputs,
                  [setting.animalType]: value,
                }))
              }
            />
          ))}
          {isOwner && (
            <Button
              title={t("buttons.save")}
              onPress={saveGestationSettings}
              loading={updateGestationSettingsMutation.isPending}
              disabled={updateGestationSettingsMutation.isPending}
            />
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
