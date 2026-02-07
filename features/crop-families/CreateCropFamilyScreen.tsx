import { ContentView } from "@/components/containers/ContentView";
import { CreateCropFamilyScreenProps } from "./navigation/crop-families-routes";
import { H2 } from "@/theme/Typography";
import { useCreateCropFamilyMutation } from "./cropFamilies.hooks";
import { CropFamilyForm, CropFamilyFormValues } from "./CropFamilyForm";
import { ScrollView } from "@/components/views/ScrollView";
import { useForm } from "react-hook-form";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useTranslation } from "react-i18next";

export function CreateCropFamilyScreen({
  navigation,
}: CreateCropFamilyScreenProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropFamilyFormValues>({
    defaultValues: {
      waitingTimeInYears: 0,
    },
  });

  const createCropFamilyMutation = useCreateCropFamilyMutation(
    (cropFamily) => {
      const previousScreen =
        navigation.getState().routes[navigation.getState().index - 1];
      // If coming from crop form, go back with the new family ID
      if (previousScreen.name === "CreateCrop" || previousScreen.name === "EditCrop") {
        navigation.goBack();
      } else {
        navigation.goBack();
      }
    },
    (error) => console.error(error)
  );

  function onCreateCropFamily(data: CropFamilyFormValues) {
    createCropFamilyMutation.mutate({
      ...data,
      waitingTimeInYears: Number(data.waitingTimeInYears),
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onCreateCropFamily)}
            disabled={!isDirty || createCropFamilyMutation.isPending}
            loading={createCropFamilyMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_families.new_crop_family")}
      >
        <H2>{t("crop_families.new_crop_family")}</H2>
        <CropFamilyForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
