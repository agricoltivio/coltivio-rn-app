import { ContentView } from "@/components/containers/ContentView";
import { H2 } from "@/theme/Typography";
import { EditCropProtectionEquipmentScreenProps } from "./navigation/equipment-routes";
import {
  CropProtectionEquipmentFormValues,
  CropProtectionEquipmentForm,
} from "./CropProtectionEquipmentForm";
import {
  useCropProtectionEquipmentByIdQuery,
  useUpdateCropProtectionEquipmentMutation,
  useDeleteCropProtectionEquipmentMutation,
} from "./cropProtectionEquipment.hooks";
import { useForm } from "react-hook-form";
import { ScrollView } from "@/components/views/ScrollView";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useTheme } from "styled-components/native";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export function EditCropProtectionEquipmentScreen({
  route,
  navigation,
}: EditCropProtectionEquipmentScreenProps) {
  const { t } = useTranslation();
  const machineId = route.params.cropProtectionEquipmentId;
  const theme = useTheme();
  const { cropProtectionEquipment } =
    useCropProtectionEquipmentByIdQuery(machineId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropProtectionEquipmentFormValues>({
    values: cropProtectionEquipment
      ? {
          ...cropProtectionEquipment,
          capacity: cropProtectionEquipment.capacity.toString(),
        }
      : undefined,
  });

  const updateMachineConfigMutation = useUpdateCropProtectionEquipmentMutation(
    () => navigation.goBack()
  );
  const deleteMachineConfigMutation = useDeleteCropProtectionEquipmentMutation(
    () => navigation.goBack()
  );

  function onSubmit(data: CropProtectionEquipmentFormValues) {
    updateMachineConfigMutation.mutate({
      id: machineId,
      ...data,
      capacity: Number(data.capacity),
    });
  }

  function onDelete() {
    deleteMachineConfigMutation.mutate(machineId);
  }

  if (!cropProtectionEquipment) {
    return null;
  }

  const submitting =
    updateMachineConfigMutation.isPending ||
    deleteMachineConfigMutation.isPending;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            <Button
              style={{ flexGrow: 1 }}
              type="secondary"
              title={t("buttons.delete")}
              onPress={onDelete}
              disabled={submitting}
              loading={deleteMachineConfigMutation.isPending}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty || submitting}
              loading={updateMachineConfigMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={cropProtectionEquipment.name}
      >
        <H2>{cropProtectionEquipment.name}</H2>
        <CropProtectionEquipmentForm
          control={control}
          errors={errors}
          restrictedMode
        />
      </ScrollView>
    </ContentView>
  );
}
