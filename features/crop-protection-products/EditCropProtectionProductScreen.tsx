import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { EditCropProtectionProductScreenProps } from "./navigation/crop-protection-product-routes";
import { H2, H3 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  CropProtectionProductForm,
  CropProtectionProductFormValues,
} from "./CropProtectionProductForm";
import {
  useCropProtectionProductByIdQuery,
  useDeleteCropProtectionProductMutation,
  useIsCropProtectionProductInUseQuery,
  useUpdateCropProtectionProductMutation,
} from "./cropProtectionProduct.hooks";
import { useCropProtectionEquipmentsQuery } from "../equipment/cropProtectionEquipment.hooks";

export function EditCropProtectionProductScreen({
  route,
  navigation,
}: EditCropProtectionProductScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const cropProtectionProductId = route.params.cropProtectionProductId;
  const { cropProtectionProduct } = useCropProtectionProductByIdQuery(
    cropProtectionProductId
  );
  const { inUse, isFetching: isFetchingInUse } =
    useIsCropProtectionProductInUseQuery(cropProtectionProductId);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<CropProtectionProductFormValues>({
    values: cropProtectionProduct,
  });

  const updateCropProtectionProductMutation =
    useUpdateCropProtectionProductMutation(() => navigation.goBack());
  const deleteCropProtectionProductMutation =
    useDeleteCropProtectionProductMutation(() => navigation.goBack());

  const productUnit = watch("unit");
  const { cropProtectionEquipments, isFetched } =
    useCropProtectionEquipmentsQuery([]);
  const availableEquipment = cropProtectionEquipments!.filter(
    (equipment) => equipment.unit === productUnit
  );

  function onSubmit(data: CropProtectionProductFormValues) {
    updateCropProtectionProductMutation.mutate({
      id: cropProtectionProductId,
      ...data,
    });
  }

  function onDelete() {
    deleteCropProtectionProductMutation.mutate(cropProtectionProductId);
  }

  if (!cropProtectionProduct || isFetchingInUse) {
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
                deleteCropProtectionProductMutation.isPending ||
                updateCropProtectionProductMutation.isPending ||
                inUse
              }
              loading={deleteCropProtectionProductMutation.isPending}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                updateCropProtectionProductMutation.isPending ||
                deleteCropProtectionProductMutation.isPending
              }
              loading={updateCropProtectionProductMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={cropProtectionProduct.name}
      >
        <H2>{cropProtectionProduct.name}</H2>
        {inUse ? (
          <Card
            style={{
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.m,
            }}
          >
            <H3 style={{ color: theme.colors.white }}>
              {t("crop_protection_product.product_in_use_warning")}
            </H3>
          </Card>
        ) : null}
        <CropProtectionProductForm
          equipments={availableEquipment}
          restrictedMode={inUse}
          control={control}
          errors={errors}
        />
      </ScrollView>
    </ContentView>
  );
}
