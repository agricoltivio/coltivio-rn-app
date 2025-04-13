import { ContentView } from "@/components/containers/ContentView";
import { CreateCropScreenProps as CreateCropScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import { useCreateCropMutation } from "./crops.hooks";
import { CropForm, CropFormValues } from "./CropsForm";
import { ScrollView } from "@/components/views/ScrollView";
import { useForm } from "react-hook-form";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useTranslation } from "react-i18next";

export function CreateCropScreen({ navigation }: CreateCropScreenProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropFormValues>();

  const createForageMutation = useCreateCropMutation(
    () => navigation.goBack(),
    (error) => console.error(error),
  );

  function onCreateCrop(data: CropFormValues) {
    createForageMutation.mutate({
      ...data,
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onCreateCrop)}
            disabled={!isDirty || createForageMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("crops.new_crop")}>
        <H2>{t("crops.new_crop")}</H2>
        <CropForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
