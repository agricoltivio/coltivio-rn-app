import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateTillageEquipmentScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import {
  TillageEquipmentForm,
  TillageEquipmentFormValues,
} from "./TillageEquipmentForm";
import { useCreateTillageEquipmentMutation } from "./tillageEquipment.hooks";
import { useTranslation } from "react-i18next";

export function CreatetillageEquipmentScreen({
  route,
  navigation,
}: CreateTillageEquipmentScreenProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<TillageEquipmentFormValues>();

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
    useCreateTillageEquipmentMutation(onSuccess);

  function onSubmit(data: TillageEquipmentFormValues) {
    createMachineConfigMutation.mutate(data);
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            style={{ flexGrow: 1 }}
            title={t("farm_equipment.new_equipment")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createMachineConfigMutation.isPending}
            loading={createMachineConfigMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={"Neue Düngemaschine"}>
        <H2>{t("tillage_equipment.new_equipment")}</H2>
        <TillageEquipmentForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
