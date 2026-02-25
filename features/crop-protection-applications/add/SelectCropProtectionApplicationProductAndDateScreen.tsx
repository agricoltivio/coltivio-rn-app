import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useCropProtectionProductsQuery } from "@/features/crop-protection-products/cropProtectionProduct.hooks";
import { H2, Body } from "@/theme/Typography";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SelectCropProtectionApplicationProductAndDateScreenProps } from "../navigation/crop-protection-application-routes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";

type FormValues = {
  date: Date;
  time: Date;
  productId: string;
};

export function SelectCropProtectionApplicationProductAndDateScreen({
  navigation,
  route,
}: SelectCropProtectionApplicationProductAndDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { cropProtectionProducts, isFetched: productsLoaded } =
    useCropProtectionProductsQuery();
  const { setData, setSelectedProduct, data, selectedProduct, reset } =
    useAddCropProtectionApplicationStore();

  const preselectedProductId = route.params?.productId;

  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: data?.date ?? new Date(),
      time: data?.time ?? new Date(),
      productId: selectedProduct?.id ?? preselectedProductId,
    },
  });

  useEffect(() => {
    if (preselectedProductId) {
      setValue("productId", preselectedProductId);
    }
  }, [preselectedProductId, setValue]);

  function onSubmit(values: FormValues) {
    const product = cropProtectionProducts?.find(
      (p) => p.id === values.productId,
    );
    if (product) {
      setSelectedProduct(product);
    }

    setData({
      date: values.date,
      time: values.time,
      productId: values.productId,
    });

    navigation.navigate("ConfigureCropProtectionApplication");
  }

  if (!productsLoaded) {
    return null;
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={handleSubmit(onSubmit)}
            disabled={cropProtectionProducts?.length === 0}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_protection_applications.add_application")}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.add_application")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHDatePicker
            name="date"
            control={control}
            label={t("forms.labels.date")}
            mode="date"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
          />

          <RHDatePicker
            name="time"
            control={control}
            label={t("forms.labels.time")}
            mode="time"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.time?.message}
          />

          {cropProtectionProducts?.length === 0 ? (
            <Card
              elevated={false}
              style={{ alignItems: "center", marginBottom: theme.spacing.m }}
            >
              <Body>
                {t(
                  "crop_protection_applications.select_product.no_products_message",
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.xs,
              }}
            >
              <View style={{ flex: 1 }}>
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
                    cropProtectionProducts?.map((p) => ({
                      label: p.name,
                      value: p.id,
                    })) ?? []
                  }
                />
              </View>
              <IonIconButton
                icon="add"
                iconSize={24}
                color="black"
                type="accent"
                onPress={() =>
                  navigation.navigate("CreateCropProtectionProduct")
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
