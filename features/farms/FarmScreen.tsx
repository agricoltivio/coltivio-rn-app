import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { FarmScreenProps } from "./navigation/farm-routes";
import { useTheme } from "styled-components/native";
import { List } from "../../components/list/List";
import { H2 } from "@/theme/Typography";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { useTranslation } from "react-i18next";

export function FarmScreen({ navigation }: FarmScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="danger"
            title={t("buttons.delete")}
            onPress={() => navigation.navigate("DeleteFarm")}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView headerTitleOnScroll={t("farm.farm")} showHeaderOnScroll>
        <H2>{t("farm.farm")}</H2>
        <List style={{ marginTop: theme.spacing.l }}>
          <List.Item
            title={t("farm.farm_name")}
            onPress={() => navigation.navigate("EditFarmName")}
          />
          <List.Item
            title={t("farm.location")}
            onPress={() => navigation.navigate("EditFarmLocation")}
            hideBottomDivider
          />
          {/* <List.Item title="Mitarbeiter" hideBottomDivider disabled /> */}
        </List>
      </ScrollView>
    </ContentView>
  );
}
