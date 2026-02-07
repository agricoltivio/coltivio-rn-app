import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useCreateAnimalMutation } from "./animals.hooks";
import { AnimalForm, AnimalFormValues } from "./AnimalForm";
import { CreateAnimalScreenProps } from "./navigation/animals-routes";

export function CreateAnimalScreen({
  route,
  navigation,
}: CreateAnimalScreenProps) {
  const { t } = useTranslation();
  const motherId = route.params?.motherId;
  const fatherId = route.params?.fatherId;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AnimalFormValues>({
    defaultValues: {
      dateOfBirth: new Date(),
      registered: false,
      motherId: motherId ?? undefined,
      fatherId: fatherId ?? undefined,
    },
  });

  const createAnimalMutation = useCreateAnimalMutation(
    () => navigation.goBack(),
    (error) => console.error(error),
  );

  function onSubmit(data: AnimalFormValues) {
    createAnimalMutation.mutate({
      ...data,
      dateOfBirth: data.dateOfBirth?.toISOString(),
      dateOfDeath: data.dateOfDeath?.toISOString(),
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
            disabled={!isDirty || createAnimalMutation.isPending}
            loading={createAnimalMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.new_animal")}
        keyboardAware
      >
        <H2>{t("animals.new_animal")}</H2>
        <AnimalForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
