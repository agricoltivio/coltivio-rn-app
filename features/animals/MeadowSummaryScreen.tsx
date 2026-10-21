import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { round } from "@/utils/math";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { usePermissions } from "@/features/user/users.hooks";
import { useTheme } from "styled-components/native";
import { useMeadowDraftStore } from "./meadow-draft.store";
import {
  useCreateMeadowMutation,
  useDeleteMeadowMutation,
  useMeadowByIdQuery,
  useUpdateMeadowMutation,
} from "./meadows.hooks";
import { MeadowSummaryScreenProps } from "./navigation/animals-routes";

type MeadowFormValues = {
  name: string;
  additionalNotes?: string;
};

export function MeadowSummaryScreen({
  route,
  navigation,
}: MeadowSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const meadowId = route.params?.meadowId;
  const isEditing = meadowId !== undefined;

  const meadowDraftStore = useMeadowDraftStore();
  const { meadow } = useMeadowByIdQuery(meadowId ?? "", isEditing);

  const createMeadowMutation = useCreateMeadowMutation(
    (meadow) => {
      meadowDraftStore.reset();
      if (route.params?.returnTo === "OutdoorScheduleForm") {
        // Close this drawer and the map, back to the schedule form that started
        // the creation, which selects the new meadow
        navigation.popTo(
          "OutdoorScheduleForm",
          { createdMeadowId: meadow.id },
          { merge: true },
        );
        return;
      }
      navigation.popTo("PlotsMap", { selectedMeadowId: meadow.id });
    },
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );
  const { canWrite } = usePermissions();
  // Back to where editing started. Coming from the meadow's overview screen,
  // that screen is closed too since the meadow is gone; on the map the drawer
  // closes by itself.
  const deleteMeadowMutation = useDeleteMeadowMutation(
    () => {
      const navigationState = navigation.getState();
      const previousRoute = navigationState.routes[navigationState.index - 1];
      if (previousRoute?.name === "MeadowOverview") {
        navigation.pop(2);
        return;
      }
      navigation.goBack();
    },
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );

  const updateMeadowMutation = useUpdateMeadowMutation(
    () => navigation.goBack(),
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );
  // Archiving keeps all data, unlike deleting; it's reversible
  const archiveMeadowMutation = useUpdateMeadowMutation(
    () => navigation.goBack(),
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );
  const isArchived = meadow?.archivedAt != null;

  function archiveMeadow() {
    if (!meadowId) return;
    archiveMeadowMutation.mutate({ id: meadowId, archived: true });
  }

  function handleArchiveToggle() {
    if (!meadowId) return;
    if (isArchived) {
      // Meadows added since archiving may overlap, so restoring asks first
      Alert.alert(
        t("archive.meadow_restore_title", { name: meadow?.name ?? "" }),
        t("archive.meadow_restore_warning"),
        [
          { text: t("buttons.cancel"), style: "cancel" },
          {
            text: t("archive.restore"),
            onPress: () =>
              archiveMeadowMutation.mutate({ id: meadowId, archived: false }),
          },
        ],
      );
      return;
    }
    confirmArchive();
  }

  // Explains what archiving does before archiving; also used from the delete alert
  function confirmArchive() {
    Alert.alert(
      t("archive.meadow_confirm_title", { name: meadow?.name ?? "" }),
      t("archive.meadow_info"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        { text: t("archive.archive"), onPress: archiveMeadow },
      ],
    );
  }

  // Deleting removes all related data, so archiving is offered as the alternative
  function handleDelete() {
    if (!meadowId) return;
    Alert.alert(
      t("archive.meadow_delete_title", { name: meadow?.name ?? "" }),
      t("archive.meadow_delete_warning"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        ...(isArchived
          ? []
          : [{ text: t("archive.archive"), onPress: confirmArchive }]),
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => deleteMeadowMutation.mutate(meadowId),
        },
      ],
    );
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeadowFormValues>({
    values: meadow
      ? { name: meadow.name, additionalNotes: meadow.additionalNotes ?? "" }
      : undefined,
  });

  const size = isEditing ? meadow?.size : meadowDraftStore.data?.size;
  const isPending =
    createMeadowMutation.isPending || updateMeadowMutation.isPending;
  const isBusy =
    isPending ||
    deleteMeadowMutation.isPending ||
    archiveMeadowMutation.isPending;

  function onSubmit({ name, additionalNotes }: MeadowFormValues) {
    const notes = additionalNotes?.trim() ? additionalNotes.trim() : null;
    if (meadowId) {
      updateMeadowMutation.mutate({
        id: meadowId,
        name,
        additionalNotes: notes,
      });
      return;
    }
    const draft = meadowDraftStore.data;
    if (!draft) return;
    createMeadowMutation.mutate({
      name,
      additionalNotes: notes,
      geometry: draft.geometry,
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <View style={{ gap: theme.spacing.xs }}>
            {/* Editing: archive and delete above save, as in the plot edit modal */}
            {meadowId && canWrite("animals") && (
              <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
                <Button
                  style={{ flex: 1 }}
                  type="accent"
                  title={
                    isArchived ? t("archive.restore") : t("archive.archive")
                  }
                  onPress={handleArchiveToggle}
                  disabled={isBusy}
                  loading={archiveMeadowMutation.isPending}
                />
                <Button
                  style={{ flex: 1 }}
                  type="dangerGhost"
                  title={t("buttons.delete")}
                  onPress={handleDelete}
                  disabled={isBusy}
                  loading={deleteMeadowMutation.isPending}
                />
              </View>
            )}
            <Button
              type="primary"
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={isBusy}
              loading={isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={
          isEditing
            ? t("animals.meadows.edit_meadow")
            : t("animals.meadows.new_meadow")
        }
        keyboardAware
      >
        <H2>
          {isEditing
            ? t("animals.meadows.edit_meadow")
            : t("animals.meadows.new_meadow")}
        </H2>
        {size !== undefined && (
          <Subtitle style={{ marginTop: theme.spacing.xs }}>
            {t("animals.meadows.size_value", {
              are: round(size / 100, 1),
              squareMeters: round(size, 0),
            })}
          </Subtitle>
        )}
        <View
          style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHTextInput
            name="name"
            control={control}
            label={t("forms.labels.name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />
          <RHTextAreaInput
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
