import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { useCreateCropProtectionApplicationsMutation } from "../cropProtectionApplications.hooks";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { CropProtectionApplicationSummary } from "../CropProtectionApplicationSummary";
import { AddCropProtectionApplicationSummaryScreenProps } from "../navigation/crop-protection-application-routes";
import {
  AddCropProtectionApplicationBase,
  useAddCropProtectionApplicationStore,
} from "./cropProtectionApplication.store";
import { useTranslation } from "react-i18next";

export function AddCropProtectionApplicationSummaryScreen({
  navigation,
}: AddCropProtectionApplicationSummaryScreenProps) {
  const { t } = useTranslation();
  const {
    selectedPlotsById,
    selectedEquipment,
    selectedProduct,
    totalNumberOfApplications = 0,
    data,
  } = useAddCropProtectionApplicationStore();

  const { dateTime, method, unit, additionalNotes, amountPerApplication } =
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
      })
    );

  function onSave() {
    createCropProtectionApplicationMutation.mutate({
      dateTime,
      equipmentId: selectedEquipment?.id,
      productId: selectedProduct?.id!,
      unit,
      amountPerApplication,
      method,
      additionalNotes,
      plots: selectedPlots.map((plot) => ({
        numberOfApplications: plot.numberOfApplications,
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
        equipmentName={selectedEquipment?.name}
        productName={selectedProduct?.name!}
        amountPerApplication={amountPerApplication}
        totalNumberOfApplications={totalNumberOfApplications}
        unit={unit}
        method={method}
        plots={selectedPlots}
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
