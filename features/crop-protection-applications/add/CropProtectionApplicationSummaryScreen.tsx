import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { useCreateCropProtectionApplicationsMutation } from "../cropProtectionApplications.hooks";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { CropProtectionApplicationSummary } from "../CropProtectionApplicationSummary";
import { CropProtectionApplicationSummaryScreenProps } from "../navigation/crop-protection-application-routes";
import {
  AddCropProtectionApplicationData,
  useAddCropProtectionApplicationStore,
} from "./cropProtectionApplication.store";
import { useTranslation } from "react-i18next";
import { combineDateAndTime } from "@/utils/date";

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

  const { date, time, method, unit, additionalNotes, amountPerUnit } =
    data as AddCropProtectionApplicationData;

  // Merge date and time into dateTime string for API
  const dateTime = combineDateAndTime(date, time).toISOString();

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
        productUnit={selectedProduct?.unit ?? "kg"}
      />
    </ContentView>
  );
}
