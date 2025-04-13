import { ContentView } from "@/components/containers/ContentView";
import { H2 } from "@/theme/Typography";
import {
  useCropByIdQuery,
  useDeleteCropMutation,
  useUpdateCropMutation,
} from "./crops.hooks";
import { CropFormValues, CropForm } from "./CropsForm";
import { EditCropScreenProps } from "@/navigation/rootStackTypes";
import { useForm } from "react-hook-form";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { View } from "react-native";
import { ScrollView } from "@/components/views/ScrollView";
import { Button } from "@/components/buttons/Button";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";

export function EditCropScreen({ route, navigation }: EditCropScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const cropId = route.params.cropId;
  const { crop } = useCropByIdQuery(cropId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CropFormValues>({ values: crop });

  const updateCropMutation = useUpdateCropMutation(() => navigation.goBack());
  const deleteCropMutation = useDeleteCropMutation(() => navigation.goBack());

  function onSubmit({ ...data }: CropFormValues) {
    updateCropMutation.mutate({
      id: cropId,
      ...data,
    });
  }

  function onDelete() {
    deleteCropMutation.mutate(cropId);
  }

  if (!crop) {
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
                updateCropMutation.isPending || deleteCropMutation.isPending
              }
            />

            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                updateCropMutation.isPending ||
                deleteCropMutation.isPending
              }
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={crop.name}>
        <H2>{crop.name}</H2>
        <CropForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
