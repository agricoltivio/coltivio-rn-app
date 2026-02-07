import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { CreateCropProtectionProductScreenProps } from "./navigation/crop-protection-product-routes";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import {
  CropProtectionProductForm,
  CropProtectionProductFormValues,
} from "./CropProtectionProductForm";
import { useCreateCropProtectionProductMutation } from "./cropProtectionProduct.hooks";
import { useTranslation } from "react-i18next";

export function CreateCropProtectionProductScreen({
  navigation,
}: CreateCropProtectionProductScreenProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<CropProtectionProductFormValues>();

  const previousRoute =
    navigation.getState().routes[navigation.getState().index - 1];

  const createCropProtectionProductMutation =
    useCreateCropProtectionProductMutation((product) => {
      if (previousRoute.name === "AddCropProtectionApplicationConfiguration") {
        navigation.popTo("AddCropProtectionApplicationConfiguration", {
          productId: product.id,
        });
      } else {
        navigation.goBack();
      }
    });

  function onSubmitCropProtectionProduct(
    data: CropProtectionProductFormValues,
  ) {
    createCropProtectionProductMutation.mutate(data);
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmitCropProtectionProduct)}
            disabled={!isDirty || createCropProtectionProductMutation.isPending}
            loading={createCropProtectionProductMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_protection_product.add_product")}
      >
        <H2>{t("crop_protection_product.add_product")}</H2>
        <CropProtectionProductForm control={control} errors={errors} />
      </ScrollView>
    </ContentView>
  );
}
