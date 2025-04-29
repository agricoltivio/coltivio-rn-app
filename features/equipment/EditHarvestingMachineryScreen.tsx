import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { EditHarvestingMachineryScreenProps } from "./navigation/equipment-routes";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  HarvestingMachineryForm,
  HarvestingMachineryFormValues,
} from "./HarvestingMachineryForm";
import {
  useDeleteHarvestingMachineryMutation,
  useHarvestingMachineryByIdQuery,
  useUpdateHarvestingMachineryMutation,
} from "./harvestingMachinery.hooks";
import { useTranslation } from "react-i18next";

export function EditHarvestingMachineryScreen({
  route,
  navigation,
}: EditHarvestingMachineryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const harvestingMachineryId = route.params.harvestingMachineryId;
  const { harvestingMachinery } = useHarvestingMachineryByIdQuery(
    harvestingMachineryId
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<HarvestingMachineryFormValues>({
    values: harvestingMachinery
      ? {
          ...harvestingMachinery,
          defaultKilosPerUnit: String(harvestingMachinery?.defaultKilosPerUnit),
        }
      : undefined,
  });

  const updateHarvestingMachinery = useUpdateHarvestingMachineryMutation(() =>
    navigation.goBack()
  );
  const deleteHarvestingMachineryMutation =
    useDeleteHarvestingMachineryMutation(() => navigation.goBack());

  function onSubmit({
    defaultKilosPerUnit,
    ...data
  }: HarvestingMachineryFormValues) {
    updateHarvestingMachinery.mutate({
      id: harvestingMachineryId,
      defaultKilosPerUnit: Number(defaultKilosPerUnit),
      ...data,
    });
  }

  function onDelete() {
    deleteHarvestingMachineryMutation.mutate(harvestingMachineryId);
  }

  if (!harvestingMachinery) {
    return null;
  }

  const submitting =
    updateHarvestingMachinery.isPending ||
    deleteHarvestingMachineryMutation.isPending;

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
              type="danger"
              title={t("buttons.delete")}
              onPress={onDelete}
              disabled={submitting}
              loading={deleteHarvestingMachineryMutation.isPending}
            />

            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty || submitting}
              loading={updateHarvestingMachinery.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={harvestingMachinery.name}
      >
        <H2>{harvestingMachinery.name}</H2>
        <HarvestingMachineryForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
