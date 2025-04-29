import { HarvestingMachinery } from "@/api/harvestingMachinery.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import {
  HarvestingMachineryForm,
  HarvestingMachineryFormValues,
} from "./HarvestingMachineryForm";
import { useCreateHarvestingMachineryMutation } from "./harvestingMachinery.hooks";
import { CreateHarvestingMachineryScreenProps } from "./navigation/equipment-routes";

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
  function onSuccess(machine: HarvestingMachinery) {
    const previousRoute =
      navigation.getState().routes[navigation.getState().index - 1].name;

    if (previousRoute === "CreateFarmEquipment") {
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "MachineConfigs" }],
      });
    } else if (previousRoute === "SelectHarvestingMachinery") {
      navigation.popTo("SelectHarvestingMachinery", {
        machineId: machine.id,
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
            loading={createHarvestingMachineryMutation.isPending}
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
