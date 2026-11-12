import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { NumberInput } from "@/components/inputs/NumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, Subtitle, Title } from "@/theme/Typography";
import { round } from "@/utils/math";
import { splitByArea } from "@/utils/splitByArea";
import React, { useEffect, useState } from "react";
import { Switch, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { DivideFertilizerApplicationOnPlotsScreenProps } from "../navigation/fertilizer-application-routes";
import { useTranslation } from "react-i18next";

export function DivideFertilizerApplicationOnPlotsScreen({
  navigation,
}: DivideFertilizerApplicationOnPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    putPlot,
    removePlot,
    totalNumberOfApplications = 0,
    selectedPlotsById,
    fertilizerApplication,
    selectedFertilizer,
  } = useCreateFertilizerApplicationStore();

  const unit = fertilizerApplication?.unit;
  const fertilizerUnit = selectedFertilizer?.unit ?? "kg";

  const [quantityByPlotId, setQuantityByPlotId] = useState<
    Record<string, string>
  >({});
  const [divideByArea, setDivideByArea] = useState(true);
  const [divisionPrecision, setDivisionPrecision] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const selectedPlots = Object.values(selectedPlotsById);

  let quantityLabel: string;
  if (unit === "total_amount" || unit === "amount_per_hectare") {
    quantityLabel = fertilizerUnit;
  } else {
    quantityLabel = t("forms.labels.load");
  }

  useEffect(() => {
    if (divideByArea) {
      const quantities = splitByArea(
        selectedPlots.map((plot) => plot.size),
        totalNumberOfApplications,
        divisionPrecision,
      );
      const next: Record<string, string> = {};
      selectedPlots.forEach((plot, index) => {
        const quantity = quantities[index];
        if (quantity === 0 && plot.size > 0 && divisionPrecision < 2) {
          setDivisionPrecision((prev) => Math.min(prev + 1, 2));
        }
        next[plot.plotId] = quantity.toString();
      });
      setQuantityByPlotId(next);
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
      setError("Die verteilte Menge ist größer als die verfügbare Menge");
      return;
    } else if (remaining > 0) {
      setError("Du hast noch nicht die gesamte Menge verteilt");
      return;
    }
    for (const fertilizerApplicationArea of selectedPlots) {
      const quantity = +quantityByPlotId[fertilizerApplicationArea.plotId];
      if (quantity > 0) {
        putPlot({
          ...fertilizerApplicationArea,
          numberOfUnits: quantity,
        });
      } else {
        removePlot(fertilizerApplicationArea.plotId);
      }
    }
    navigation.navigate("FertilizerApplicationSummary");
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
          "fertilizer_application.divide_on_plots.header_title",
        )}
        keyboardAware
      >
        <H2>{t("fertilizer_application.divide_on_plots.heading")}</H2>
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
              // width: 150,
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
