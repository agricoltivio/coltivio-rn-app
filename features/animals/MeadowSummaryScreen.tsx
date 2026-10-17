import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { round } from "@/utils/math";
import { CommonActions } from "@react-navigation/native";
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
      if (route.params?.returnTo === "previous") {
        // Close this drawer and the map, back to wherever creation started,
        // telling that screen which meadow was created so it can select it
        const navigationState = navigation.getState();
        const startRoute = navigationState.routes[navigationState.index - 2];
        if (startRoute) {
          navigation.dispatch({
            ...CommonActions.setParams({ createdMeadowId: meadow.id }),
            source: startRoute.key,
          });
        }
        navigation.pop(2);
        return;
      }
      navigation.popTo("PlotsMap", { selectedMeadowId: meadow.id });
    },
    (error) => console.log(error),
  );
  const { canWrite } = usePermissions();
  // Back to the map; the meadow drawer closes since the meadow is gone
  const deleteMeadowMutation = useDeleteMeadowMutation(() =>
    navigation.goBack(),
  );

  function handleDelete() {
    if (!meadowId) return;
    Alert.alert(t("animals.meadows.delete_confirm"), undefined, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMeadowMutation.mutate(meadowId),
      },
    ]);
  }

  const updateMeadowMutation = useUpdateMeadowMutation(
    () => navigation.goBack(),
    (error) => console.log(error),
  );

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
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            {/* Editing: delete next to save, as in the plot edit modal */}
            {meadowId && canWrite("animals") && (
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={handleDelete}
                disabled={isPending || deleteMeadowMutation.isPending}
                loading={deleteMeadowMutation.isPending}
              />
            )}
            <Button
              style={{ flexGrow: 1 }}
              type="primary"
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending || deleteMeadowMutation.isPending}
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
