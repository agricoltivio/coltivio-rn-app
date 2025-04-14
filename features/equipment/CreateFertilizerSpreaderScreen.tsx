import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateFertilizerSpreaderScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FertilizerSpreaderForm,
  FertilizerSpreaderFormValues,
} from "./FertilizerSpreaderForm";
import { useCreateFertilizerSpreaderMutation } from "./fertilizerSpreader.hooks";
import { Card } from "@/components/card/Card";
import { useTheme } from "styled-components/native";

export function CreateFertilizerSpreaderScreen({
  navigation,
}: CreateFertilizerSpreaderScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FertilizerSpreaderFormValues>();

  function onSuccess() {
    const navigationState = navigation.getState();
    if (
      navigationState.routes[navigationState.index - 1].name ===
      "CreateFarmEquipment"
    ) {
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "MachineConfigs" }],
      });
    } else {
      navigation.goBack();
    }
  }

  const createMachineConfigMutation =
    useCreateFertilizerSpreaderMutation(onSuccess);

  function onSubmit(data: FertilizerSpreaderFormValues) {
    createMachineConfigMutation.mutate({
      ...data,
      capacity: Number(data.capacity),
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            style={{ flexGrow: 1 }}
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createMachineConfigMutation.isPending}
            loading={createMachineConfigMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("farm_equipment.new_equipment")}
        keyboardAware
      >
        <H2>{t("fertilizer_spreaders.new_spreader")}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.danger,
            marginTop: theme.spacing.m,
          }}
        >
          <H3 style={{ color: theme.colors.white }}>
            {t("fertilizer_spreaders.only_same_unit_warning")}
          </H3>
        </Card>
        <FertilizerSpreaderForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
