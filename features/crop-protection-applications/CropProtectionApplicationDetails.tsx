import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { CropProtectionApplicationDetailsScreenProps } from "./navigation/crop-protection-application-routes";
import { useTheme } from "styled-components/native";
import {
  useDeleteCropProtectionApplicationMutation,
  useCropProtectionApplicationQuery,
} from "./cropProtectionApplications.hooks";
import { CropProtectionApplicationSummary } from "./CropProtectionApplicationSummary";
import { useTranslation } from "react-i18next";

export function CropProtectionApplicationDetailsScreen({
  route,
  navigation,
}: CropProtectionApplicationDetailsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const cropProtectionApplicationId = route.params.cropProtectionApplicationId;
  const { cropProtectionApplication } = useCropProtectionApplicationQuery(
    cropProtectionApplicationId
  );

  const deleteMutation = useDeleteCropProtectionApplicationMutation(() => {
    navigation.goBack();
  });
  if (!cropProtectionApplication) {
    return null;
  }

  const { dateTime, additionalNotes } = cropProtectionApplication;

  function onDelete() {
    deleteMutation.mutate(cropProtectionApplicationId);
  }
  return (
    <ContentView>
      <CropProtectionApplicationSummary
        date={dateTime}
        equipmentName={cropProtectionApplication.equipment?.name}
        productName={cropProtectionApplication.product.name!}
        amountPerApplication={cropProtectionApplication.amountPerApplication}
        totalNumberOfApplications={
          cropProtectionApplication.numberOfApplications
        }
        unit={cropProtectionApplication.unit}
        method={cropProtectionApplication.method}
        plots={[
          {
            plotId: cropProtectionApplication.plotId,
            name: cropProtectionApplication.plot.name,
            numberOfApplications:
              cropProtectionApplication.numberOfApplications,
            geometry: cropProtectionApplication.geometry,
            size: cropProtectionApplication.size,
          },
        ]}
        hidePlotList
        additionalNotes={additionalNotes}
      />
      <Button
        style={{ marginBottom: theme.spacing.m }}
        type="secondary"
        title={t("buttons.delete")}
        onPress={onDelete}
      />
    </ContentView>
  );
}
