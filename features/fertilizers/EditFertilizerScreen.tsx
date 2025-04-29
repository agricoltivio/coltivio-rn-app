import { ContentView } from "@/components/containers/ContentView";
import { EditFertilizerScreenProps } from "./navigation/fertilizer-routes";
import { H2, H3 } from "@/theme/Typography";
import { FertilizerForm, FertilizerFormValues } from "./FertilizerForm";
import {
  useDeleteFertilizerMutation,
  useFertilizerByIdQuery,
  useIsFertilizerInUseQuery,
  useUpdateFertilizerMutation,
} from "./fertilizers.hooks";
import { ScrollView } from "@/components/views/ScrollView";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { View } from "react-native";
import { Button } from "@/components/buttons/Button";
import { useForm } from "react-hook-form";
import { useTheme } from "styled-components/native";
import { Card } from "@/components/card/Card";
import { useTranslation } from "react-i18next";
import { useFertilizerSpreadersQuery } from "../equipment/fertilizerSpreader.hooks";

export function EditFertilizerScreen({
  route,
  navigation,
}: EditFertilizerScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fertilizerId = route.params.fertilizerId;
  const { fertilizer } = useFertilizerByIdQuery(fertilizerId);
  const { inUse, isFetching: isFetchingInUse } =
    useIsFertilizerInUseQuery(fertilizerId);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FertilizerFormValues>({ values: fertilizer });

  const updateFertilizerMutation = useUpdateFertilizerMutation(() =>
    navigation.goBack()
  );
  const deleteFertilizerMutation = useDeleteFertilizerMutation(() =>
    navigation.goBack()
  );

  const { fertilizerSpreaders, isFetched } = useFertilizerSpreadersQuery([]);
  const availableSpreaders = fertilizerSpreaders!.filter(
    (spreader) => spreader.unit === fertilizer?.unit
  );

  function onSubmit({ defaultSpreaderId, ...data }: FertilizerFormValues) {
    updateFertilizerMutation.mutate({
      id: fertilizerId,
      ...data,
      defaultSpreaderId:
        defaultSpreaderId !== "none" ? defaultSpreaderId : null,
    });
  }

  function onDelete() {
    deleteFertilizerMutation.mutate(fertilizerId);
  }

  if (!fertilizer || isFetchingInUse) {
    return null;
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            <Button
              style={{ flexGrow: 1 }}
              type="danger"
              title={t("buttons.delete")}
              onPress={handleSubmit(onDelete)}
              disabled={
                deleteFertilizerMutation.isPending ||
                updateFertilizerMutation.isPending ||
                inUse
              }
              loading={deleteFertilizerMutation.isPending}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                updateFertilizerMutation.isPending ||
                deleteFertilizerMutation.isPending
              }
              loading={updateFertilizerMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={fertilizer.name}>
        <H2>{fertilizer.name}</H2>
        {inUse ? (
          <Card
            style={{
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.m,
            }}
          >
            <H3 style={{ color: theme.colors.white }}>
              {t("fertilizers.product_in_use_warning")}
            </H3>
          </Card>
        ) : null}
        <FertilizerForm
          restrictedMode
          control={control}
          errors={errors}
          spreaders={availableSpreaders}
        />
      </ScrollView>
    </ContentView>
  );
}
