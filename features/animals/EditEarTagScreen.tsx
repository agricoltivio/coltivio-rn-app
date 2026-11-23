import { ApiError } from "@/api/api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useUpdateEarTagNumberMutation } from "./earTags.hooks";
import { useDiscardChangesPrompt } from "@/navigation/useDiscardChangesPrompt";
import { EditEarTagScreenProps } from "./navigation/animals-routes";

// Changes the number of one ear tag, e.g. a typo or a format the range didn't cover. An
// assigned tag keeps its animal.
export function EditEarTagScreen({ route, navigation }: EditEarTagScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { earTagId, number, animalName } = route.params;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ number: string }>({ defaultValues: { number } });
  // Asks before leaving with unsaved changes
  useDiscardChangesPrompt(isDirty);

  const updateMutation = useUpdateEarTagNumberMutation(
    () => navigation.goBack(),
    (error) =>
      Alert.alert(
        t("common.error"),
        error instanceof ApiError && error.code === "ear_tag_number_taken"
          ? t("ear_tags.number_taken")
          : t("common.unknown_error"),
      ),
  );

  function onSubmit(values: { number: string }) {
    updateMutation.mutate({ earTagId, number: values.number.trim() });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || updateMutation.isPending}
            loading={updateMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("ear_tags.edit_ear_tag")}
        keyboardAware
      >
        <H2>{t("ear_tags.edit_ear_tag")}</H2>
        {animalName && (
          <Subtitle style={{ marginTop: theme.spacing.xs }}>
            {t("ear_tags.assigned_to", { name: animalName })}
          </Subtitle>
        )}
        <View style={{ marginTop: theme.spacing.m }}>
          <RHTextInput
            name="number"
            control={control}
            label={t("ear_tags.number")}
            autoCapitalize="characters"
            rules={{
              validate: (value) =>
                value.trim().length > 0 || t("forms.validation.required"),
            }}
            error={errors.number?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
