import { ContentView } from "@/components/containers/ContentView";
import { H2, H3 } from "@/theme/Typography";
import {
  useCropFamilyByIdQuery,
  useDeleteCropFamilyMutation,
  useIsCropFamilyInUseQuery,
  useUpdateCropFamilyMutation,
} from "./cropFamilies.hooks";
import { CropFamilyFormValues, CropFamilyForm } from "./CropFamilyForm";
import { EditCropFamilyScreenProps } from "./navigation/crop-families-routes";
import { useForm } from "react-hook-form";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { View } from "react-native";
import { ScrollView } from "@/components/views/ScrollView";
import { Button } from "@/components/buttons/Button";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/card/Card";

export function EditCropFamilyScreen({
  route,
  navigation,
}: EditCropFamilyScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const familyId = route.params.familyId;
  const { cropFamily } = useCropFamilyByIdQuery(familyId);
  const { inUse } = useIsCropFamilyInUseQuery(familyId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropFamilyFormValues>({
    values: cropFamily
      ? {
          ...cropFamily,
          additionalNotes: cropFamily.additionalNotes ?? undefined,
        }
      : undefined,
  });

  const updateCropFamilyMutation = useUpdateCropFamilyMutation(() =>
    navigation.goBack(),
  );
  const deleteCropFamilyMutation = useDeleteCropFamilyMutation(() =>
    navigation.goBack(),
  );

  function onSubmit({ ...data }: CropFamilyFormValues) {
    updateCropFamilyMutation.mutate({
      id: familyId,
      ...data,
      waitingTimeInYears: Number(data.waitingTimeInYears),
    });
  }

  function onDelete() {
    deleteCropFamilyMutation.mutate(familyId);
  }

  if (!cropFamily) {
    return null;
  }

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
              disabled={
                inUse ||
                updateCropFamilyMutation.isPending ||
                deleteCropFamilyMutation.isPending
              }
              loading={deleteCropFamilyMutation.isPending}
            />

            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                updateCropFamilyMutation.isPending ||
                deleteCropFamilyMutation.isPending
              }
              loading={
                updateCropFamilyMutation.isPending ||
                deleteCropFamilyMutation.isPending
              }
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={cropFamily.name}>
        <H2>{cropFamily.name}</H2>
        {inUse ? (
          <Card
            style={{
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.m,
            }}
          >
            <H3 style={{ color: theme.colors.white }}>
              {t("crop_families.family_in_use_warning")}
            </H3>
          </Card>
        ) : null}
        <CropFamilyForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
