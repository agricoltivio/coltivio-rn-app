import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { PlotCropProtectionApplicationsOfYearListScreenProps } from "./navigation/plots-routes";
import { H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropProtectionApplicationsForPlotQuery } from "../crop-protection-applications/cropProtectionApplications.hooks";
import { getMethodLabel } from "../crop-protection-applications/cropProtectionApplication.utils";
import { useTranslation } from "react-i18next";

export function PlotCropProtectionApplicationsOfYearListScreen({
  route,
  navigation,
}: PlotCropProtectionApplicationsOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year, name, plotId } = route.params;
  const theme = useTheme();
  const { cropProtectionApplications } =
    useCropProtectionApplicationsForPlotQuery(plotId);
  const [searchText, setSearchText] = useState("");

  if (!cropProtectionApplications) {
    return null;
  }

  const sanitizedCropProtectionApplications = cropProtectionApplications.map(
    (cropProtectionApplication) => ({
      ...cropProtectionApplication,
      dateTime: formatLocalizedDate(
        new Date(cropProtectionApplication.dateTime),
        locale,
        "long",
        false,
      ),
    }),
  );

  const fuse = new Fuse(sanitizedCropProtectionApplications ?? [], {
    minMatchCharLength: 1,
    keys: ["dateTime", "product.name", "method"],
  });

  let searchResult = sanitizedCropProtectionApplications;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: cropProtectionApplication,
  }: {
    item: (typeof sanitizedCropProtectionApplications)[number];
  }) => (
    <ListItem
      key={cropProtectionApplication.id}
      onPress={() =>
        navigation.navigate("CropProtectionApplicationDetails", {
          cropProtectionApplicationId: cropProtectionApplication.id,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>
          {cropProtectionApplication.dateTime}
        </ListItem.Title>
        <ListItem.Body>
          {cropProtectionApplication.numberOfUnits *
            cropProtectionApplication.amountPerUnit}
          {cropProtectionApplication.unit}{" "}
          {cropProtectionApplication.product.name} (
          {cropProtectionApplication.method
            ? getMethodLabel(cropProtectionApplication.method)
            : ""}
          )
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View>
        <H2>
          {t("crop_protection_applications.crop_protection_year", { year })}
        </H2>
        <H3>{t("plots.plot_name", { name })}</H3>
      </View>
      <View style={{ marginVertical: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>

      <FlatList
        contentContainerStyle={{
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
        }}
        data={searchResult}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </ContentView>
  );
}
