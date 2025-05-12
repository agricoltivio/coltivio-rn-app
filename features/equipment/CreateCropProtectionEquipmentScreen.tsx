import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateCropProtectionEquipmentScreenProps } from "./navigation/equipment-routes";
import { H2, H3, H4 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import {
  CropProtectionEquipmentForm,
  CropProtectionEquipmentFormValues,
} from "./CropProtectionEquipmentForm";
import { useCreateCropProtectionEquipmentMutation } from "./cropProtectionEquipment.hooks";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/card/Card";
import { useTheme } from "styled-components/native";
import { CropProtectionEquipment } from "@/api/cropProtectionEquipments.api";

export function CreateCropProtectionEquipmentScreen({
  route,
  navigation,
}: CreateCropProtectionEquipmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const unit = route.params.unit;
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropProtectionEquipmentFormValues>({ defaultValues: { unit } });

  function onSuccess(equipment: CropProtectionEquipment) {
    const navigationState = navigation.getState();
    const previousRoute =
      navigationState.routes[navigationState.index - 1].name;
    if (previousRoute === "CreateFarmEquipment") {
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "MachineConfigs" }],
      });
    } else if (
      previousRoute === "AddCropProtectionApplicationSelectMachineConfig"
    ) {
      navigation.popTo("AddCropProtectionApplicationSelectMachineConfig", {
        equipmentId: equipment.id,
      });
    } else {
      navigation.goBack();
    }
  }

  const createMachineConfigMutation = useCreateCropProtectionEquipmentMutation(
    onSuccess,
    (error) => console.log(error)
  );

  function onSubmit(data: CropProtectionEquipmentFormValues) {
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
        <H2>{t("crop_protection_equipments.new_equipment")}</H2>
        <CropProtectionEquipmentForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
