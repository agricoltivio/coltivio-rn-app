import { ContentView } from "@/components/containers/ContentView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { ScrollView } from "@/components/views/ScrollView";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useTheme } from "styled-components/native";
import { View } from "react-native";
import { EditTillageEquipmentScreenProps } from "./navigation/equipment-routes";
import {
  useDeleteTillageEquipmentMutation,
  useTillageEquipmentByIdQuery,
  useUpdateTillageEquipmentMutation,
} from "./tillageEquipment.hooks";
import {
  TillageEquipmentForm,
  TillageEquipmentFormValues,
} from "./TillageEquipmentForm";
import { useTranslation } from "react-i18next";

export function EditTillageEquipmentScreen({
  route,
  navigation,
}: EditTillageEquipmentScreenProps) {
  const machineId = route.params.tillageEquipmentId;
  const { t } = useTranslation();
  const theme = useTheme();
  const { tillageEquipment } = useTillageEquipmentByIdQuery(machineId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<TillageEquipmentFormValues>({
    values: tillageEquipment,
  });

  const updateMachineConfigMutation = useUpdateTillageEquipmentMutation(() =>
    navigation.goBack()
  );
  const deleteMachineConfigMutation = useDeleteTillageEquipmentMutation(() =>
    navigation.goBack()
  );

  function onSubmit(data: TillageEquipmentFormValues) {
    updateMachineConfigMutation.mutate({
      id: machineId,
      ...data,
    });
  }

  function onDelete() {
    deleteMachineConfigMutation.mutate(machineId);
  }

  if (!tillageEquipment) {
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
          <View style={{ flexDirection: "row" }}>
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
        headerTitleOnScroll={tillageEquipment.name}
      >
        <H2>{tillageEquipment.name}</H2>
        <TillageEquipmentForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
