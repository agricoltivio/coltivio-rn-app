import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { NumberInput } from "@/components/inputs/NumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { DivideCropProtectionApplicationOnPlotsScreenProps } from "../navigation/crop-protection-application-routes";
import { Body, H2, Subtitle, Title } from "@/theme/Typography";
import { round } from "@/utils/math";
import React, { useEffect, useState } from "react";
import { Switch, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { useTranslation } from "react-i18next";

export function DivideCropProtectionApplicationOnPlotsScreen({
  navigation,
}: DivideCropProtectionApplicationOnPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    putPlot,
    removePlot,
    totalNumberOfUnits: totalNumberOfApplications = 0,
    selectedPlotsById,
    data,
    selectedProduct,
  } = useAddCropProtectionApplicationStore();

  const unit = data?.unit;
  const productUnit = selectedProduct?.unit ?? "kg";

  const [quantityByPlotId, setQuantityByPlotId] = useState<
    Record<string, string>
  >({});
  const [divideByArea, setDivideByArea] = useState(true);
  const [divisionPrecision, setDivisionPrecision] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const selectedPlots = Object.values(selectedPlotsById);

  let quantityLabel: string;
  if (unit === "total_amount" || unit === "amount_per_hectare") {
    quantityLabel = productUnit;
  } else {
    quantityLabel = t("units.long.load");
  }

  useEffect(() => {
    if (divideByArea) {
      const totalArea = selectedPlots.reduce((acc, plot) => {
        return acc + plot.size;
      }, 0);
      let totalDivided = 0;
      selectedPlots.forEach((plot, index) => {
        if (round(plot.size, divisionPrecision) === 0) {
          setQuantityByPlotId((prev) => ({
            ...prev,
            [plot.plotId]: "0",
          }));
        } else {
          const fraction = plot.size / totalArea;
          let quantity = 0;
          // we give the rest to the last item
          if (index === selectedPlots.length - 1) {
            quantity = round(
              totalNumberOfApplications - totalDivided,
              divisionPrecision,
            );
          } else {
            quantity = round(
              (totalNumberOfApplications - totalDivided) * fraction,
              divisionPrecision,
            );
          }
          if (quantity === 0 && divisionPrecision < 2) {
            setDivisionPrecision((prev) => Math.min(prev + 1, 2));
          }
          totalDivided += quantity;
          setQuantityByPlotId((prev) => ({
            ...prev,
            [plot.plotId]: quantity.toString(),
          }));
        }
        // putCropProtectionApplicationPlot({
        //   ...area,
        //   producedUnits: quantity,
        //   amountInKilos: quantity * cropProtectionApplication!.kilosPerUnit,
        // });
      });
    }
  }, [divideByArea, selectedPlotsById, divisionPrecision]);

  const totalDivided = +Object.values(quantityByPlotId)
    .reduce((total, val) => total + Number(val), 0)
    .toFixed(2);

  useEffect(() => {
    if (
      error &&
      totalDivided >= 0 &&
      totalDivided <= totalNumberOfApplications
    ) {
      setError(null);
    }
  }, [totalDivided]);

  function handleRemove(plotId: string) {
    removePlot(plotId);
    setQuantityByPlotId((prev) => {
      const values = { ...prev };
      delete values[plotId];
      return values;
    });
  }

  function handleOnConfirm() {
    const remaining = round(totalNumberOfApplications - totalDivided, 2);
    if (remaining < 0) {
      setError(t("forms.validation.divided_amount_too_big"));
      return;
    } else if (remaining > 0) {
      setError(t("forms.validation.not_all_divided"));
      return;
    }
    for (const cropProtectionApplicationArea of selectedPlots) {
      const quantity = +quantityByPlotId[cropProtectionApplicationArea.plotId];
      if (quantity > 0) {
        putPlot({
          ...cropProtectionApplicationArea,
          numberOfUnits: quantity,
        });
      } else {
        removePlot(cropProtectionApplicationArea.plotId);
      }
    }
    navigation.navigate("CropProtectionApplicationSummary");
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button title={t("buttons.next")} onPress={handleOnConfirm} />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t(
          "crop_protection_applications.divide_on_plots.header_title",
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.divide_on_plots.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          <Title
            style={{
              marginTop: theme.spacing.m,
            }}
          >
            {t("common.remaining_quantity", {
              quantity: round(totalNumberOfApplications - totalDivided, 2),
              quantityLabel,
            })}
          </Title>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: theme.spacing.m,
            }}
          >
            <Subtitle style={{ flexGrow: 1 }}>
              {t("forms.labels.divide_by_plot_size")}
            </Subtitle>
            <Switch
              value={divideByArea}
              onChange={(e) => setDivideByArea((prev) => !prev)}
            />
          </View>
          <View
            style={{
              marginTop: theme.spacing.m,
              alignSelf: "center",
              gap: theme.spacing.xs,
            }}
          >
            {selectedPlots.map((selectedPlot, index) => (
              <View
                key={selectedPlot.plotId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.m,
                  width: "100%",
                }}
              >
                <Subtitle
                  style={{ flexGrow: 1, flexShrink: 1 }}
                  numberOfLines={1}
                >
                  {t("forms.labels.plot_w_size", {
                    name: selectedPlot.name,
                    size: (selectedPlot.size / 100).toPrecision(3),
                  })}
                </Subtitle>
                <NumberInput
                  style={{ width: 80 }}
                  placeholder={quantityLabel}
                  value={quantityByPlotId[selectedPlot.plotId]?.toString()}
                  onChangeText={(value) =>
                    setQuantityByPlotId((prev) => ({
                      ...prev,
                      [selectedPlot.plotId]: value,
                    }))
                  }
                  hideLabel
                  float
                />
                <IonIconButton
                  type="danger"
                  icon="close"
                  iconSize={30}
                  onPress={() => handleRemove(selectedPlot.plotId)}
                />
              </View>
            ))}
          </View>
          {error && (
            <View
              style={{
                borderRadius: 10,
                backgroundColor: theme.colors.danger,
                opacity: 0.7,
                marginTop: theme.spacing.m,
                padding: theme.spacing.s,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Body style={{ fontWeight: 800, color: "white" }}>{error}</Body>
            </View>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
