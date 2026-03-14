import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { AgriColtivioInfoScreenProps } from "./navigation/agri-coltivio-routes";
import { Body, H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { useTheme } from "styled-components/native";
import { supabase } from "@/supabase/supabase";

export function AgriColtivioInfoScreen({}: AgriColtivioInfoScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  async function openMembershipUrl() {
    const baseUrl = __DEV__ ? "http://localhost:4000" : "https://app.coltivio.ch";
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session) {
      const url = `${baseUrl}/auth/token?access_token=${session.access_token}&refresh_token=${session.refresh_token}&redirect=/membership`;
      Linking.openURL(url);
    } else {
      Linking.openURL(`${baseUrl}/membership`);
    }
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("agri_coltivio.become_member")}
            style={{ marginTop: theme.spacing.m }}
            onPress={openMembershipUrl}
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
          {t("membership.community_text")}
        </Body>
      </ScrollView>
    </ContentView>
  );
}
