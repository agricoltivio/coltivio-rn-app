import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { useCreateCropProtectionApplicationsMutation } from "../cropProtectionApplications.hooks";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { CropProtectionApplicationSummary } from "../CropProtectionApplicationSummary";
import { CropProtectionApplicationSummaryScreenProps } from "../navigation/crop-protection-application-routes";
import {
  AddCropProtectionApplicationBase,
  useAddCropProtectionApplicationStore,
} from "./cropProtectionApplication.store";
import { useTranslation } from "react-i18next";

export function CropProtectionApplicationSummaryScreen({
  navigation,
}: CropProtectionApplicationSummaryScreenProps) {
  const { t } = useTranslation();
  const {
    selectedPlotsById,
    selectedProduct,
    totalNumberOfUnits: totalNumberOfApplications = 0,
    data,
  } = useAddCropProtectionApplicationStore();

  const { dateTime, method, unit, additionalNotes, amountPerUnit } =
    data as AddCropProtectionApplicationBase;

  const selectedPlots = Object.values(selectedPlotsById);

  const createCropProtectionApplicationMutation =
    useCreateCropProtectionApplicationsMutation(() =>
      navigation.reset({
        index: 2,
        routes: [
          { name: "Home" },
          { name: "FieldCalendar" },
          { name: "CropProtectionApplications" },
        ],
      }),
    );

  function onSave() {
    createCropProtectionApplicationMutation.mutate({
      dateTime,
      productId: selectedProduct?.id!,
      unit,
      amountPerUnit,
      method,
      additionalNotes,
      plots: selectedPlots.map((plot) => ({
        numberOfUnits: plot.numberOfUnits,
        geometry: plot.geometry,
        plotId: plot.plotId,
        size: plot.size,
      })),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={onSave}
            disabled={createCropProtectionApplicationMutation.isPending}
            loading={createCropProtectionApplicationMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <CropProtectionApplicationSummary
        date={dateTime}
        productName={selectedProduct?.name!}
        amountPerUnit={amountPerUnit}
        totalNumberOfUnits={totalNumberOfApplications}
        unit={unit}
        method={method}
        plots={selectedPlots}
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
