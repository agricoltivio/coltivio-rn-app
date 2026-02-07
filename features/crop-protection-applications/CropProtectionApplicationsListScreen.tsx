import { CropProtectionApplication } from "@/api/cropProtectionApplications.api";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { CropProtectionApplicationsOfYearListScreenProps } from "./navigation/crop-protection-application-routes";
import { H2 } from "@/theme/Typography";
import { formatLocalizedDateTime } from "@/utils/date";
import Fuse from "fuse.js";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropProtectionApplicationsQuery } from "./cropProtectionApplications.hooks";
import { round } from "@/utils/math";

export function CropProtectionApplicationsOfYearListScreen({
  route,
  navigation,
}: CropProtectionApplicationsOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const fromDate = new Date(year, 0, 1); // January 1st of the specified year
  const toDate = new Date(year + 1, 0, 1); // January 1st of the next year
  const { cropProtectionApplications } = useCropProtectionApplicationsQuery(
    fromDate,
    toDate,
  );
  const [searchText, setSearchText] = useState("");

  if (!cropProtectionApplications) {
    return null;
  }

  const sanitizedCropProtectionApplications = cropProtectionApplications.map(
    (cropProtectionApplication) => ({
      ...cropProtectionApplication,
      dateTime: formatLocalizedDateTime(
        new Date(cropProtectionApplication.dateTime),
        locale,
        "long",
        false,
      ),
    }),
  );

  const fuse = new Fuse(sanitizedCropProtectionApplications ?? [], {
    minMatchCharLength: 1,
    keys: ["date", "product.name", "plot.name", "method"],
  });

  let searchResult = sanitizedCropProtectionApplications;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: cropProtectionApplication,
  }: {
    item: CropProtectionApplication;
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
          {t("crop_protection_applications.list.title", {
            plotName: cropProtectionApplication.plot.name,
            date: cropProtectionApplication.dateTime,
          })}
        </ListItem.Title>
        <ListItem.Body>
          {t("crop_protection_applications.list.body", {
            totalAmount: round(
              cropProtectionApplication.numberOfUnits *
                cropProtectionApplication.amountPerUnit,
              2,
            ),
            unit: cropProtectionApplication.unit,
            product: cropProtectionApplication.product.name,
            method: cropProtectionApplication.method
              ? t(
                  `crop_protection_applications.methods.${cropProtectionApplication.method}`,
                )
              : "",
          })}
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <H2 style={{ flex: 1 }}>
          {t("crop_protection_applications.crop_protection_year", { year })}
        </H2>
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
