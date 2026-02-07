import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FertilizerForm, FertilizerFormValues } from "./FertilizerForm";
import { useCreateFertilizerMutation } from "./fertilizers.hooks";
import { CreateFertilizerScreenProps } from "./navigation/fertilizer-routes";

export function CreateFertilizerScreen({
  navigation,
}: CreateFertilizerScreenProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FertilizerFormValues>();

  const previousRoute =
    navigation.getState().routes[navigation.getState().index - 1];

  const createFertilizerMutation = useCreateFertilizerMutation((fertilizer) => {
    if (previousRoute.name === "AddFertilizerApplicationConfiguration") {
      navigation.popTo("AddFertilizerApplicationConfiguration", {
        fertilizerId: fertilizer.id,
      });
    } else {
      navigation.goBack();
    }
  });

  function onSubmitFertilizer({
    defaultSpreaderId,
    ...data
  }: FertilizerFormValues) {
    createFertilizerMutation.mutate({
      ...data,
      defaultSpreaderId:
        defaultSpreaderId !== "none" ? defaultSpreaderId : undefined,
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmitFertilizer)}
            disabled={!isDirty || createFertilizerMutation.isPending}
            loading={createFertilizerMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("fertilizers.new_fertilizer")}
        keyboardAware
      >
        <H2>{t("fertilizers.new_fertilizer")}</H2>
        <FertilizerForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
