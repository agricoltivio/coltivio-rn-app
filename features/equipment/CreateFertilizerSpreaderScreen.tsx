import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateFertilizerSpreaderScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3, H4 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FertilizerSpreaderForm,
  FertilizerSpreaderFormValues,
} from "./FertilizerSpreaderForm";
import { useCreateFertilizerSpreaderMutation } from "./fertilizerSpreader.hooks";
import { Card } from "@/components/card/Card";
import { useTheme } from "styled-components/native";
import { FertilizerSpreader } from "@/api/fertilizerSpreaders.api";

export function CreateFertilizerSpreaderScreen({
  navigation,
  route,
}: CreateFertilizerSpreaderScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { unit } = route.params;
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FertilizerSpreaderFormValues>({ defaultValues: { unit } });

  function onSuccess(spreader: FertilizerSpreader) {
    const navigationState = navigation.getState();
    const previousScreen =
      navigationState.routes[navigationState.index - 1].name;
    if (previousScreen === "CreateFarmEquipment") {
      navigation.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "MachineConfigs" }],
      });
    } else if (previousScreen === "AddFertilizerApplicationSelectSpreader") {
      navigation.popTo("AddFertilizerApplicationSelectSpreader", {
        spreaderId: spreader.id,
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
          elevated
          style={{
            backgroundColor: theme.colors.accent,
            margin: theme.spacing.s,
          }}
        >
          <H4>{t("fertilizer_spreaders.only_same_unit_warning")}</H4>
        </Card>
        <FertilizerSpreaderForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
