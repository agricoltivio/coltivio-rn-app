import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { NumberInput } from "@/components/inputs/NumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, Subtitle, Title } from "@/theme/Typography";
import { round } from "@/utils/math";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch, View } from "react-native";
import { useTheme } from "styled-components/native";
import { DivideSowingOnPlotsScreenProps } from "../navigation/sowing-routes";
import { useSowingUnitsQuery } from "../sowings.hooks";
import { formatArea } from "../sowingUnits";
import { useCreateSowingStore } from "./sowing.store";

export function DivideSowingOnPlotsScreen({
  navigation,
}: DivideSowingOnPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { sowingUnits } = useSowingUnitsQuery();
  const { sowing, putSowingPlot, removeSowingPlot, selectedPlotsById } =
    useCreateSowingStore();

  const totalAmount = sowing?.amount ?? 0;
  const unitLabel = sowing?.unit ? t(`sowings.units.${sowing.unit}`) : "";
  // seeds and plants are whole pieces, weights get two decimals
  const isCount =
    sowingUnits?.find((unitInfo) => unitInfo.unit === sowing?.unit)
      ?.quantityKind === "count";
  const precision = isCount ? 0 : 2;

  const [amountByPlotId, setAmountByPlotId] = useState<Record<string, string>>(
    {},
  );
  const [divideByArea, setDivideByArea] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plots = Object.values(selectedPlotsById);

  useEffect(() => {
    if (!divideByArea) return;
    const totalSize = plots.reduce((sum, plot) => sum + plot.size, 0);
    let divided = 0;
    const next: Record<string, string> = {};
    plots.forEach((plot, index) => {
      // the rest goes to the last plot so the amounts always sum up exactly
      const amount =
        index === plots.length - 1
          ? round(totalAmount - divided, precision)
          : round(
              // tiny drawn slivers can round to 0 m², split equally then
              totalAmount *
                (totalSize > 0 ? plot.size / totalSize : 1 / plots.length),
              precision,
            );
      divided += amount;
      next[plot.plotId] = amount.toString();
    });
    setAmountByPlotId(next);
  }, [divideByArea, selectedPlotsById, precision]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDivided = round(
    Object.values(amountByPlotId).reduce(
      (total, value) => total + Number(value),
      0,
    ),
    2,
  );
  const remaining = round(totalAmount - totalDivided, 2);

  useEffect(() => {
    if (error && remaining === 0) setError(null);
  }, [remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRemove(plotId: string) {
    removeSowingPlot(plotId);
    setAmountByPlotId((prev) => {
      const values = { ...prev };
      delete values[plotId];
      return values;
    });
  }

  function handleOnConfirm() {
    if (remaining < 0) {
      setError(t("forms.validation.divided_amount_too_big"));
      return;
    } else if (remaining > 0) {
      setError(t("forms.validation.not_all_divided"));
      return;
    }
    // at least one plot has to get something, otherwise nothing would be saved
    if (!plots.some((plot) => Number(amountByPlotId[plot.plotId]) > 0)) {
      setError(t("forms.validation.greater_than_zero"));
      return;
    }
    for (const plot of plots) {
      const amount = Number(amountByPlotId[plot.plotId]);
      if (amount > 0) {
        putSowingPlot({ ...plot, amount });
      } else {
        removeSowingPlot(plot.plotId);
      }
    }
    navigation.navigate("SowingSummary");
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
        headerTitleOnScroll={t("sowings.divide_on_plots")}
        keyboardAware
      >
        <H2>{t("sowings.divide_on_plots")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          <Title style={{ marginTop: theme.spacing.m }}>
            {t("common.remaining_quantity", {
              quantity: remaining,
              quantityLabel: unitLabel,
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
              onChange={() => setDivideByArea((prev) => !prev)}
            />
          </View>
          <View
            style={{
              marginTop: theme.spacing.m,
              alignSelf: "center",
              gap: theme.spacing.xs,
            }}
          >
            {plots.map((plot) => (
              <View
                key={plot.plotId}
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
                  {t("plots.plot_name", { name: plot.name })} (
                  {formatArea(plot.size)})
                </Subtitle>
                <NumberInput
                  style={{ width: 90 }}
                  placeholder={unitLabel}
                  value={amountByPlotId[plot.plotId]}
                  onChangeText={(value) => {
                    setDivideByArea(false);
                    setAmountByPlotId((prev) => ({
                      ...prev,
                      [plot.plotId]: value,
                    }));
                  }}
                  hideLabel
                  float
                />
                <IonIconButton
                  type="danger"
                  icon="close"
                  iconSize={30}
                  onPress={() => handleRemove(plot.plotId)}
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
