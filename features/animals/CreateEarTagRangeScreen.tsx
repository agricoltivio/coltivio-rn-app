import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { useCreateEarTagRangeMutation } from "./earTags.hooks";
import { CreateEarTagRangeScreenProps } from "./navigation/animals-routes";

type EarTagRangeFormValues = {
  fromNumber: string;
  toNumber: string;
};

export function CreateEarTagRangeScreen({
  navigation,
}: CreateEarTagRangeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EarTagRangeFormValues>();

  const createEarTagRangeMutation = useCreateEarTagRangeMutation(
    () => navigation.goBack(),
    (error) => console.error(error),
  );

  function onSubmit(data: EarTagRangeFormValues) {
    createEarTagRangeMutation.mutate(data);
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createEarTagRangeMutation.isPending}
            loading={createEarTagRangeMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("ear_tags.new_ear_tag_range")}
        keyboardAware
      >
        <H2>{t("ear_tags.new_ear_tag_range")}</H2>
        <View
          style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHTextInput
            name="fromNumber"
            control={control}
            label={t("ear_tags.from_number")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.fromNumber?.message}
          />
          <RHTextInput
            name="toNumber"
            control={control}
            label={t("ear_tags.to_number")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.toNumber?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
