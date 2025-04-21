import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateFertilizerScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { FertilizerForm, FertilizerFormValues } from "./FertilizerForm";
import { useCreateFertilizerMutation } from "./fertilizers.hooks";
import { useTranslation } from "react-i18next";
import { useFertilizerSpreadersQuery } from "../equipment/fertilizerSpreader.hooks";

export function CreateFertilizerScreen({
  navigation,
}: CreateFertilizerScreenProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FertilizerFormValues>();

  const previousRoute =
    navigation.getState().routes[navigation.getState().index - 1];

  const createFertilizerMutation = useCreateFertilizerMutation((fertilizer) => {
    if (previousRoute.name === "AddFertilizerApplicationSelectFertilizer") {
      navigation.popTo("AddFertilizerApplicationSelectFertilizer", {
        fertilizerId: fertilizer.id,
      });
    } else {
      navigation.goBack();
    }
  });

  const fertilizerUnit = watch("unit");
  const { fertilizerSpreaders, isFetched } = useFertilizerSpreadersQuery([]);
  const availableSpreaders = fertilizerSpreaders!.filter(
    (spreader) => spreader.unit === fertilizerUnit
  );

  function onSubmitFertilizer({
    defaultSpreaderId,
    ...data
  }: FertilizerFormValues) {
    createFertilizerMutation.mutate({
      ...data,
      defaultSpreaderId:
        defaultSpreaderId !== "none" ? defaultSpreaderId : null,
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
        <FertilizerForm
          control={control}
          errors={errors}
          spreaders={availableSpreaders}
        />
      </ScrollView>
    </ContentView>
  );
}
