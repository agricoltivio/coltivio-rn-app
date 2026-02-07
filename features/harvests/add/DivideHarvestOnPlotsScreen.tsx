import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { NumberInput } from "@/components/inputs/NumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { DivideHarvestOnPlotsScreenProps } from "../navigation/harvest-routes";
import { Body, H2, Subtitle, Title } from "@/theme/Typography";
import { round } from "@/utils/math";
import React, { useEffect, useState } from "react";
import { Switch, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateHarvestStore } from "./harvest.store";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { useTranslation } from "react-i18next";

export function DivideHarvestOnPlotsScreen({
  navigation,
}: DivideHarvestOnPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    harvest,
    putHarvestPlot,
    removeHarvestPlot,
    totalProducedUnits = 0,
    selectedPlotsById: selectedHarvestPlotsById,
  } = useCreateHarvestStore();

  const [quantityByPlotId, setQuantityByPlotId] = useState<
    Record<string, string>
  >({});
  const [divideByArea, setDivideByArea] = useState(false);
  const [divisionPrecision, setDivisionPrecision] = useState(
    harvest?.unit === "round_bale" ||
      harvest?.unit === "square_bale" ||
      harvest?.unit === "crate"
      ? 0
      : 1,
  );
  const [error, setError] = useState<string | null>(null);

  const harvestAreas = Object.values(selectedHarvestPlotsById);

  let quantityLabel: string = "";
  switch (harvest!.unit) {
    case "load":
      quantityLabel = t("forms.labels.loads");
      break;
    case "round_bale":
    case "square_bale":
      quantityLabel = t("forms.labels.balls");
      break;
    case "crate":
      quantityLabel = t("forms.labels.crate");
      break;
  }

  useEffect(() => {
    if (divideByArea) {
      const totalArea = harvestAreas.reduce((acc, harvestPlot) => {
        return acc + harvestPlot.harvestSize;
      }, 0);
      let totalDivided = 0;
      harvestAreas.forEach((area, index) => {
        if (round(area.harvestSize, divisionPrecision) === 0) {
          setQuantityByPlotId((prev) => ({
            ...prev,
            [area.plotId]: "0",
          }));
        } else {
          const fraction = area.harvestSize / totalArea;
          let quantity = 0;
          // we give the rest to the last item
          if (index === harvestAreas.length - 1) {
            quantity = round(
              totalProducedUnits - totalDivided,
              divisionPrecision,
            );
          } else if (harvest?.unit === "load") {
            quantity = round(
              (totalProducedUnits - totalDivided) * fraction,
              divisionPrecision,
            );
          } else {
            quantity = round(
              (totalProducedUnits - totalDivided) * fraction,
              divisionPrecision,
            );
          }
          if (quantity === 0) {
            setDivisionPrecision((prev) => prev + 1);
          }
          totalDivided += quantity;
          setQuantityByPlotId((prev) => ({
            ...prev,
            [area.plotId]: quantity.toString(),
          }));
        }
        // putHarvestPlot({
        //   ...area,
        //   producedUnits: quantity,
        //   amountInKilos: quantity * harvest!.kilosPerUnit,
        // });
      });
    }
  }, [divideByArea, selectedHarvestPlotsById, divisionPrecision]);

  const totalDivided = +Object.values(quantityByPlotId)
    .reduce((total, val) => total + Number(val), 0)
    .toFixed(1);

  useEffect(() => {
    if (error && totalDivided >= 0 && totalDivided <= totalProducedUnits) {
      setError(null);
    }
  }, [totalDivided]);

  function handleRemove(plotId: string) {
    removeHarvestPlot(plotId);
    setQuantityByPlotId((prev) => {
      const values = { ...prev };
      delete values[plotId];
      return values;
    });
  }

  function handleOnConfirm() {
    const remaining = totalProducedUnits - totalDivided;
    if (remaining < 0) {
      setError(t("forms.validation.divided_amount_too_big"));
      return;
    } else if (remaining > 0) {
      setError(t("forms.validation.not_all_divided"));
      return;
    }
    for (const harvestArea of harvestAreas) {
      const quantity = +quantityByPlotId[harvestArea.plotId];
      if (quantity > 0) {
        putHarvestPlot({
          ...harvestArea,
          numberOfUnits: quantity,
        });
      } else {
        removeHarvestPlot(harvestArea.plotId);
      }
    }
    navigation.navigate("AddHarvestAdditionalNotes");
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
        headerTitleOnScroll={t("harvests.divide_on_plots.header_title")}
        keyboardAware
      >
        <H2>{t("harvests.divide_on_plots.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          <Title
            style={{
              marginTop: theme.spacing.m,
            }}
          >
            {t("common.remaining_quantity", {
              quantity: totalProducedUnits - totalDivided,
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
            {harvestAreas.map((harvestArea, index) => (
              <View
                key={harvestArea.plotId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.m,
                  width: "100%",
                }}
              >
                <Subtitle style={{ flexGrow: 1 }}>
                  {t("plots.plot_name", { name: harvestArea.name })} (
                  {(harvestArea.harvestSize / 100).toPrecision(3)}a)
                </Subtitle>
                <NumberInput
                  style={{ width: 80 }}
                  placeholder={quantityLabel}
                  value={quantityByPlotId[harvestArea.plotId]?.toString()}
                  onChangeText={(value) =>
                    setQuantityByPlotId((prev) => ({
                      ...prev,
                      [harvestArea.plotId]: value,
                    }))
                  }
                  hideLabel
                  float
                />
                <IonIconButton
                  type="danger"
                  icon="close"
                  iconSize={30}
                  onPress={() => handleRemove(harvestArea.plotId)}
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
