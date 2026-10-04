import { useParcelLayerLastUpdatedQuery } from "@/api/layers.hooks";
import { Button } from "@/components/buttons/Button";
import { Body, H3 } from "@/theme/Typography";
import { Trans, useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Modal, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmPlotsQuery } from "../plots/plots.hooks";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useActiveFarm } from "./ActiveFarmContext";

export function FarmCreatedModal() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { activeFarmId } = useActiveFarm();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  const visible =
    activeFarmId !== null &&
    localSettings.farmCreatedModalPendingFarmIds.includes(activeFarmId);

  const lastUpdatedQuery = useParcelLayerLastUpdatedQuery(visible);
  const plotsQuery = useFarmPlotsQuery();
  // No plots after setup means the parcel import failed for this farm
  const hasNoPlots =
    plotsQuery.plots !== undefined && plotsQuery.plots.length === 0;
  const isLoading =
    (lastUpdatedQuery.isPending && lastUpdatedQuery.isFetching) ||
    plotsQuery.isPending;

  function dismiss() {
    updateLocalSettings(
      "farmCreatedModalPendingFarmIds",
      localSettings.farmCreatedModalPendingFarmIds.filter(
        (farmId) => farmId !== activeFarmId,
      ),
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.l,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: theme.spacing.l,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <H3 style={{ marginBottom: theme.spacing.m }}>
            {t("farm_created_modal.title")}
          </H3>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : hasNoPlots ? (
            <>
              <Body>{t("farm_created_modal.no_plots")}</Body>
              <Body style={{ marginTop: theme.spacing.s }}>
                <Trans
                  i18nKey="farm_created_modal.no_plots_hint"
                  components={{
                    email: (
                      <Body
                        style={{
                          fontWeight: "bold",
                          textDecorationLine: "underline",
                        }}
                        onPress={() =>
                          Linking.openURL("mailto:support@coltivio.ch")
                        }
                      />
                    ),
                  }}
                />
              </Body>
            </>
          ) : (
            <>
              <Body>
                {lastUpdatedQuery.data ? (
                  <Trans
                    i18nKey="farm_created_modal.message"
                    values={{
                      date: lastUpdatedQuery.data.toLocaleDateString(
                        i18n.language,
                      ),
                    }}
                    components={{
                      bold: <Body style={{ fontWeight: "bold" }} />,
                    }}
                  />
                ) : (
                  t("farm_created_modal.message_no_date")
                )}
              </Body>
              <Body style={{ marginTop: theme.spacing.s }}>
                {t("farm_created_modal.review_hint")}
              </Body>
            </>
          )}
          <Button
            style={{ marginTop: theme.spacing.l }}
            title={t("farm_created_modal.lets_go")}
            onPress={dismiss}
          />
        </View>
      </View>
    </Modal>
  );
}
