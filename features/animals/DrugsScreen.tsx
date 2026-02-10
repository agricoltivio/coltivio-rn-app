import { Drug } from "@/api/drugs.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDrugsQuery } from "./drugs.hooks";
import { DrugsScreenProps } from "./navigation/animals-routes";

export function DrugsScreen({ navigation }: DrugsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { drugs } = useDrugsQuery();
  const [searchText, setSearchText] = useState("");

  const fuse = useMemo(() => {
    if (!drugs) return null;
    return new Fuse(drugs, {
      minMatchCharLength: 1,
      keys: ["name", "notes"],
    });
  }, [drugs]);

  const searchResult = useMemo(() => {
    if (!drugs) return [];
    if (searchText.length === 0) return drugs;
    return fuse!.search(searchText).map((result) => result.item);
  }, [drugs, fuse, searchText]);

  const renderItem = useCallback(
    ({ item: drug }: { item: Drug }) => (
      <ListItem
        key={drug.id}
        style={{ paddingVertical: 5 }}
        onPress={() => navigation.navigate("EditDrug", { drugId: drug.id })}
      >
        <ListItem.Content>
          <ListItem.Title>{drug.name}</ListItem.Title>
          <ListItem.Body>
            {drug.notes ||
              `${drug.drugTreatment.length} ${t("drugs.treatment_definitions")}`}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [t, navigation],
  );

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("drugs.drugs")}>
        <H2>{t("drugs.drugs")}</H2>

        <View style={{ marginTop: theme.spacing.m }}>
          <TextInput
            hideLabel
            placeholder={t("forms.placeholders.search")}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>

        <View style={{ marginTop: theme.spacing.m, flex: 1 }}>
          {searchResult.length === 0 && (
            <Subtitle>{t("drugs.no_drugs")}</Subtitle>
          )}
          {searchResult.length > 0 && (
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={searchResult}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}
        </View>
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("CreateDrug", {})}
      />
    </ContentView>
  );
}
