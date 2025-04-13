import { PlotHarvest } from "@/api/harvests.api";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { PlotHarvestsOfYearListScreenProps } from "@/navigation/rootStackTypes";
import { H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import { useTheme } from "styled-components/native";
import { useHarvestsOfPlotQuery } from "../harvests/harvests.hooks";

export function PlotHarvestsOfYearListScreen({
  route,
  navigation,
}: PlotHarvestsOfYearListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, year, name } = route.params;
  const { harvests: parcelHarvests } = useHarvestsOfPlotQuery(plotId);

  const harvestsOfYear = parcelHarvests?.filter(
    (harvest) => new Date(harvest.date).getFullYear() === year
  );

  const sanitizedHarvests = harvestsOfYear?.map(
    ({ date, processingType, conservationMethod, crop, ...harvest }) => ({
      date: formatLocalizedDate(new Date(date), locale, "long", false),
      processingType: t(`harvests.labels.processing_type.${processingType}`),
      conservationMethod: t(
        `harvests.labels.conservation_method.${conservationMethod}`
      ),
      cropName: crop.name,
      unit: t(`harvests.labels.unit.${processingType}`),
      ...harvest,
    })
  );

  const renderItem = ({
    item: harvest,
  }: {
    item: Omit<
      PlotHarvest,
      "crop" | "processingType" | "conservationMethod"
    > & {
      cropName: string;
      processingType: string;
      conservationMethod: string;
      unit: string;
    };
  }) => (
    <ListItem
      key={harvest.id}
      onPress={() =>
        navigation.navigate("HarvestDetails", {
          harvestId: harvest.id,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>{harvest.date} </ListItem.Title>
        <ListItem.Body>
          {harvest.producedUnits * harvest.kilosPerUnit}kg, {harvest.cropName},{" "}
          {harvest.conservationMethod}, {harvest.processingType}
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );

  return (
    <ContentView>
      <H2>{t("harvests.harvest_year", { year })}</H2>
      <H3>{t("plots.plot_name", { name })}</H3>
      <FlatList
        style={{ marginTop: theme.spacing.m }}
        contentContainerStyle={{
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
        }}
        data={sanitizedHarvests ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </ContentView>
  );
}
