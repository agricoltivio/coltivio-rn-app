import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateCropProtectionEquipmentScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import {
  CropProtectionEquipmentForm,
  CropProtectionEquipmentFormValues,
} from "./CropProtectionEquipmentForm";
import { useCreateCropProtectionEquipmentMutation } from "./cropProtectionEquipment.hooks";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/card/Card";
import { useTheme } from "styled-components/native";

export function CreateCropProtectionEquipmentScreen({
  route,
  navigation,
}: CreateCropProtectionEquipmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropProtectionEquipmentFormValues>();

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
      >
        <H2>{t("crop_protection_equipments.new_equipment")}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.danger,
            marginTop: theme.spacing.m,
          }}
        >
          <H3 style={{ color: theme.colors.white }}>
            {t("crop_protection_equipments.only_same_unit_warning")}
          </H3>
        </Card>
        <CropProtectionEquipmentForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
