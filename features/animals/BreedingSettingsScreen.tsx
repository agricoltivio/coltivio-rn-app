import { useApi } from "@/api/api";
import { AnimalType } from "@/api/animals.api";
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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useGestationSettingsQuery,
  useUpdateGestationSettingsMutation,
} from "./breeding.hooks";
import { BreedingSettingsScreenProps } from "./navigation/animals-routes";

const REMINDER_OFF = "off";
const REMINDER_DAY_OPTIONS = [0, 1, 3, 7, 14, 30];

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
  const [notificationPermissionBlocked, setNotificationPermissionBlocked] =
    useState(false);

  useEffect(() => {
    if (!gestationSettings) return;
    setGestationInputs(
      Object.fromEntries(
        gestationSettings.map((setting) => [
          setting.animalType,
          String(setting.gestationDays),
        ]),
      ),
    );
  }, [gestationSettings]);

  function saveGestationSettings() {
    if (!gestationSettings) return;
    updateGestationSettingsMutation.mutate({
      settings: gestationSettings.map((setting) => {
        const gestationDays = parseInt(
          gestationInputs[setting.animalType] ?? "",
          10,
        );
        const isValidValue =
          Number.isFinite(gestationDays) && gestationDays > 0;
        // An empty field resets the type to its default. An unchanged default stays a default, so
        // later changes of the default still apply and it keeps its "default" label.
        const keepsDefault =
          setting.isDefault && gestationDays === setting.gestationDays;
        return {
          animalType: setting.animalType,
          gestationDays: isValidValue && !keepsDefault ? gestationDays : null,
        };
      }),
    });
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
      setNotificationPermissionBlocked(permission?.blocked ?? false);
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
          {notificationPermissionBlocked && (
            <>
              <Body style={{ color: theme.colors.gray2 }}>
                {t("settings.task_push_notifications.permission_denied")}
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
