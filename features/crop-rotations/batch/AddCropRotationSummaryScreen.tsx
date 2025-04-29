import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { hexToRgba } from "@/theme/theme";
import { H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import * as turf from "@turf/turf";
import { Text, View } from "react-native";
import { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useCreateCropRotationsMutation } from "../crop-rotations.hooks";
import {
  CropRotationBase,
  useCreateCropRotationStore,
} from "./crop-rotations.store";
import { AddCropRotationSummaryScreenProps } from "../navigation/crop-rotations-routes";
import { Card } from "@/components/card/Card";
import { useTranslation } from "react-i18next";

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: theme.spacing.s,
        gap: theme.spacing.m,
      }}
    >
      <Text style={{ flex: 1, fontWeight: 600, fontSize: 18 }}>{label}</Text>
      <Text style={{ fontSize: 18 }}>{value}</Text>
    </View>
  );
}

export function AddCropRotationSummaryScreen({
  navigation,
}: AddCropRotationSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { selectedPlotsById, selectedCrop, cropRotations } =
    useCreateCropRotationStore();

  const { cropId, fromDate, toDate } = cropRotations as CropRotationBase;

  const selectedPlots = Object.values(selectedPlotsById);

  const createCropRotationsMutation = useCreateCropRotationsMutation(() =>
    navigation.reset({
      index: 1,
      routes: [
        { name: "Home" },
        { name: "FieldCalendar" },
        { name: "CropRotations" },
      ],
    })
  );

  const centroid = turf.centroid(selectedPlots[0].geometry);
  const [longitude, latitude] = centroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  function onSave() {
    createCropRotationsMutation.mutate({
      fromDate,
      plotIds: selectedPlots.map((plot) => plot.plotId),
      cropId,
      toDate,
    });
  }

  const formattedDate = formatLocalizedDate(new Date(fromDate), locale);
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={onSave}
            disabled={createCropRotationsMutation.isPending}
            loading={createCropRotationsMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.sowing_date", {
          date: formattedDate,
        })}
      >
        <H2>{t("crop_rotations.sowing")}</H2>
        <H3>
          {formattedDate} - {selectedCrop?.name}
        </H3>
        <View
          style={{
            height: 250,
            borderRadius: 10,
            overflow: "hidden",
            marginTop: theme.spacing.m,
          }}
        >
          <MapView provider={PROVIDER_GOOGLE} initialRegion={initialRegion}>
            {selectedPlots.map((plot) => {
              return (
                <MultiPolygon
                  key={plot.plotId}
                  polygon={plot.geometry}
                  strokeWidth={theme.map.defaultStrokeWidth}
                  strokeColor={"white"}
                  fillColor={hexToRgba(
                    theme.map.defaultFillColor,
                    theme.map.defaultFillAlpha
                  )}
                />
              );
            })}
          </MapView>
        </View>
        <Card style={{ marginTop: theme.spacing.m }}>
          <SummaryItem
            label={t("forms.labels.crop")}
            value={selectedCrop?.name!}
          />
          {selectedCrop?.variety ? (
            <SummaryItem
              label={t("forms.labels.kind")}
              value={selectedCrop.variety}
            />
          ) : null}
          <SummaryItem label={t("forms.labels.date")} value={formattedDate} />
        </Card>
      </ScrollView>
    </ContentView>
  );
}
