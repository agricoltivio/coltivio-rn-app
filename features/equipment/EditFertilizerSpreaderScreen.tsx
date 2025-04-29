import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { EditFertilizerSpreaderScreenProps } from "./navigation/equipment-routes";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  FertilizerSpreaderForm,
  FertilizerSpreaderFormValues,
} from "./FertilizerSpreaderForm";
import {
  useDeleteFertilizerSpreaderMutation,
  useFertilizerSpreaderByIdQuery,
  useUpdateFertilizerSpreaderMutation,
} from "./fertilizerSpreader.hooks";
import { useTheme } from "styled-components/native";

export function EditFertilizerSpreaderScreen({
  route,
  navigation,
}: EditFertilizerSpreaderScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const machineId = route.params.fertilizerSpreaderId;
  const { fertilizerSpreader } = useFertilizerSpreaderByIdQuery(machineId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FertilizerSpreaderFormValues>({
    values: fertilizerSpreader
      ? {
          ...fertilizerSpreader,
          capacity: fertilizerSpreader.capacity.toString(),
        }
      : undefined,
  });

  const updateMachineConfigMutation = useUpdateFertilizerSpreaderMutation(() =>
    navigation.goBack()
  );
  const deleteMachineConfigMutation = useDeleteFertilizerSpreaderMutation(() =>
    navigation.goBack()
  );

  function onSubmit(data: FertilizerSpreaderFormValues) {
    updateMachineConfigMutation.mutate({
      id: machineId,
      ...data,
      capacity: Number(data.capacity),
    });
  }

  function onDelete() {
    deleteMachineConfigMutation.mutate(machineId);
  }

  if (!fertilizerSpreader) {
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
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.s,
            }}
          >
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
        headerTitleOnScroll={fertilizerSpreader.name}
      >
        <H2>{fertilizerSpreader.name}</H2>
        <FertilizerSpreaderForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
