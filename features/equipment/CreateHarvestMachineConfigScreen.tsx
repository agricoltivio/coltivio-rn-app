import { useForm } from "react-hook-form";
import {
  HarvestingMachineryForm,
  HarvestingMachineryFormValues,
} from "./HarvestingMachineryForm";
import { useCreateHarvestingMachineryMutation } from "./harvestingMachinery.hooks";
import { Button } from "@/components/buttons/Button";
import { useTheme } from "styled-components/native";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { CreateHarvestingMachineryScreenProps } from "./navigation/equipment-routes";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useTranslation } from "react-i18next";

export function CreateHarvestingMachineryScreen({
  navigation,
}: CreateHarvestingMachineryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<HarvestingMachineryFormValues>();
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
  const createHarvestingMachineryMutation =
    useCreateHarvestingMachineryMutation(onSuccess);

  function onSubmitHarvestingMachinery(data: HarvestingMachineryFormValues) {
    createHarvestingMachineryMutation.mutate({
      ...data,
      defaultKilosPerUnit: Number(data.defaultKilosPerUnit),
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmitHarvestingMachinery)}
            disabled={!isDirty || createHarvestingMachineryMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("farm_equipment.new_equipment")}
      >
        <H2>{t("harvest_equipments.new_harvester")}</H2>
        <Card style={{ marginTop: theme.spacing.m }}>
          <Subtitle>{t("harvest_equipments.info_default_values")}</Subtitle>
        </Card>
        <HarvestingMachineryForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
