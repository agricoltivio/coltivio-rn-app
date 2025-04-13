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
import { Card } from "@/components/card/Card";
import { useTheme } from "styled-components/native";

export function CreateFertilizerScreen({
  navigation,
}: CreateFertilizerScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FertilizerFormValues>();

  const createFertilizerMutation = useCreateFertilizerMutation(() =>
    navigation.goBack()
  );

  function onSubmitFertilizer(data: FertilizerFormValues) {
    createFertilizerMutation.mutate(data);
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
      >
        <H2>{t("fertilizers.new_fertilizer")}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.danger,
            marginTop: theme.spacing.m,
          }}
        >
          <H3 style={{ color: theme.colors.white }}>
            {t("fertilizers.warning_unit_not_editable")}
          </H3>
        </Card>
        <FertilizerForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
