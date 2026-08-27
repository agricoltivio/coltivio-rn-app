import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { AgriColtivioInfoScreenProps } from "./navigation/agri-coltivio-routes";
import { Body, H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { canLinkToMembership, goToMembershipScreen } from "@/utils/membership";
import {
  useMembership,
  useMembershipStatusQuery,
} from "@/features/farms/farms.hooks";
import { AgriColtivioPitch } from "./AgriColtivioPitch";

export function AgriColtivioInfoScreen({
  navigation,
}: AgriColtivioInfoScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isActive } = useMembership();
  const { membershipStatus } = useMembershipStatusQuery();

  const periodEndDate =
    typeof membershipStatus?.lastPeriodEnd === "string" &&
    membershipStatus.lastPeriodEnd.length > 0
      ? new Date(membershipStatus.lastPeriodEnd)
      : null;
  const periodStillRunning = periodEndDate !== null && periodEndDate > new Date();
  // Resigned (Austritt), but the paid-through date hasn't passed yet — they can still undo it
  // from the membership screen, so send them there instead of into a brand new payment flow.
  const canUndoResignation =
    !!membershipStatus?.cancelledByUser && periodStillRunning;

  return (
    <ContentView
      footerComponent={
        canLinkToMembership ? (
          <BottomActionContainer>
            {isActive ? (
              <Body style={{ color: theme.colors.gray1, textAlign: "center" }}>
                {t("membership.thank_you.subtitle")}
              </Body>
            ) : canUndoResignation ? (
              <Button
                title={t("membership.manage_membership")}
                onPress={() => goToMembershipScreen(navigation)}
              />
            ) : (
              <>
                <Body style={{ color: theme.colors.gray1, textAlign: "center" }}>
                  {t("membership.price_info")}
                </Body>
                <Button
                  title={t("agri_coltivio.become_member")}
                  style={{ marginTop: theme.spacing.s }}
                  onPress={() => goToMembershipScreen(navigation, true)}
                />
              </>
            )}
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll="AgriColtivio">
        <H2>AgriColtivio</H2>
        <AgriColtivioPitch />
      </ScrollView>
    </ContentView>
  );
}
