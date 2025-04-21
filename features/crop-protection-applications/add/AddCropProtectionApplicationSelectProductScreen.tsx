import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useCropProtectionProductsQuery } from "@/features/crop-protection-products/cropProtectionProduct.hooks";
import { Body, H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { AddCropProtectionApplicationSelectProductScreenProps } from "@/navigation/rootStackTypes";
import { useTranslation } from "react-i18next";

type FormValues = {
  productId: string;
};
export function AddCropProtectionApplicationSelectProductScreen({
  navigation,
  route,
}: AddCropProtectionApplicationSelectProductScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { cropProtectionProducts: products } = useCropProtectionProductsQuery();

  const { setData, data, selectedProduct, setSelectedProduct } =
    useAddCropProtectionApplicationStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { productId: selectedProduct?.id },
  });

  const createdProductId = route.params.productId;

  useEffect(() => {
    if (createdProductId) {
      setValue("productId", createdProductId);
    }
  }, [createdProductId]);

  function onSubmit({ productId }: FormValues) {
    const selectedProduct = products?.find(
      (cropProtection) => cropProtection.id === productId
    )!;
    setData({
      productId,
      unit: selectedProduct.unit,
    });
    setSelectedProduct(selectedProduct);

    navigation.navigate("AddCropProtectionApplicationSelectMachineConfig", {});
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={handleSubmit(onSubmit)}
            disabled={products?.length === 0}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t(
          "crop_protection_applications.select_product.heading"
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.select_product.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
          {products?.length === 0 ? (
            <Card
              elevated={false}
              style={{
                alignItems: "center",
                marginBottom: theme.spacing.m,
              }}
            >
              <Body>
                {t(
                  "crop_protection_applications.select_product.no_products_message"
                )}
              </Body>
              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                fontSize={16}
                title={t("buttons.add")}
                onPress={() =>
                  navigation.navigate("CreateCropProtectionProduct")
                }
              />
            </Card>
          ) : (
            <RHSelect
              name="productId"
              control={control}
              label={t("forms.labels.crop_protection_product")}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.productId?.message}
              data={
                products?.map((product) => ({
                  label: product.name,
                  value: product.id,
                })) ?? []
              }
            />
          )}

          {products?.length ? (
            <Button
              title={t("crop_protection_product.add_product")}
              type="accent"
              style={{ marginTop: theme.spacing.m }}
              onPress={() => navigation.navigate("CreateCropProtectionProduct")}
            />
          ) : null}
        </View>
      </ScrollView>
    </ContentView>
  );
}
