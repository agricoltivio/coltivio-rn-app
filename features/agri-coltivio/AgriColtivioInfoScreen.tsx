import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { AgriColtivioInfoScreenProps } from "./navigation/agri-coltivio-routes";
import { Body, H2 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { canLinkToMembership } from "@/utils/membership";
import { useMembershipCheckoutMutation } from "@/features/farms/farms.hooks";
import { AgriColtivioPitch } from "./AgriColtivioPitch";
import { StatutenDialog } from "./StatutenDialog";

export function AgriColtivioInfoScreen({}: AgriColtivioInfoScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const checkoutMutation = useMembershipCheckoutMutation();
  const [statutenVisible, setStatutenVisible] = useState(false);

  return (
    <ContentView
      footerComponent={
        canLinkToMembership ? (
          <BottomActionContainer>
            <Body style={{ color: theme.colors.gray1, textAlign: "center" }}>
              {t("membership.price_info")}
            </Body>
            <Button
              title={t("agri_coltivio.become_member")}
              style={{ marginTop: theme.spacing.s }}
              onPress={() => setStatutenVisible(true)}
              loading={checkoutMutation.isPending}
            />
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll="AgriColtivio">
        <H2>AgriColtivio</H2>
        <AgriColtivioPitch />
      </ScrollView>

      <StatutenDialog
        visible={statutenVisible}
        onClose={() => setStatutenVisible(false)}
        onConfirm={(autoRenew) => checkoutMutation.mutate(autoRenew)}
      />
    </ContentView>
  );
}
