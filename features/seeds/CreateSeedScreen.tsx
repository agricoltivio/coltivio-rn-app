import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSowingUnitsQuery } from "../sowings/sowings.hooks";
import { CreateSeedScreenProps } from "./navigation/seed-routes";
import { SeedForm, SeedFormValues } from "./SeedForm";
import { parseQuantityKind, seedDefaultRateFromForm } from "./seedFormValues";
import { useCreateSeedMutation } from "./seeds.hooks";

export function CreateSeedScreen({ navigation }: CreateSeedScreenProps) {
  const { t } = useTranslation();
  const { sowingUnits } = useSowingUnitsQuery();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SeedFormValues>({ defaultValues: { quantityKind: "weight" } });

  const previousRoute =
    navigation.getState().routes[navigation.getState().index - 1];

  const createSeedMutation = useCreateSeedMutation((seed) => {
    // opened from the sowing wizard: hand the new seed back to it
    if (previousRoute?.name === "SelectSowingSeedAndDate") {
      navigation.popTo("SelectSowingSeedAndDate", { seedId: seed.id });
    } else {
      navigation.goBack();
    }
  });

  function onSubmit(values: SeedFormValues) {
    const quantityKind = parseQuantityKind(values.quantityKind);
    if (!quantityKind) return;
    const { defaultAmount, defaultUnit } = seedDefaultRateFromForm(
      values,
      sowingUnits ?? [],
    );
    createSeedMutation.mutate({
      name: values.name,
      cropId: values.cropId,
      quantityKind,
      defaultAmount: defaultAmount ?? undefined,
      defaultUnit: defaultUnit ?? undefined,
      description: values.description || undefined,
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createSeedMutation.isPending}
            loading={createSeedMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("seeds.new_seed")}
        keyboardAware
      >
        <H2>{t("seeds.new_seed")}</H2>
        <SeedForm control={control} errors={errors} setValue={setValue} />
      </ScrollView>
    </ContentView>
  );
}
