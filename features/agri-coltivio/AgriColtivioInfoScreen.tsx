import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { AgriColtivioInfoScreenProps } from "@/navigation/rootStackTypes";
import { Body, H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { useTheme } from "styled-components/native";

export function AgriColtivioInfoScreen({}: AgriColtivioInfoScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title="www.coltivio.ch"
            style={{ marginTop: theme.spacing.m }}
            onPress={() => Linking.openURL("https://coltivio.ch")}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll="AgriColtivio">
        <H2>AgriColtivio</H2>
        <H3>{t("agri_coltivio.subheading")}</H3>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("agri_coltivio.section_1")}
        </Body>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("agri_coltivio.section_2")}
        </Body>
        <Body style={{ marginTop: theme.spacing.m }}>
          <Body style={{ fontWeight: "bold" }}>
            {t("agri_coltivio.section_3_bold")}
          </Body>
          {t("agri_coltivio.section_3")}
        </Body>
        <Body style={{ marginTop: theme.spacing.m, fontWeight: "bold" }}>
          {t("agri_coltivio.section_4")}
        </Body>
        <H3 style={{ marginTop: theme.spacing.l }}>
          {t("agri_coltivio.section_5_title")}
        </H3>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("agri_coltivio.section_5")}
        </Body>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("agri_coltivio.section_6")}
        </Body>
      </ScrollView>
    </ContentView>
  );
}
