import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { FieldCalendarExportSuccessScreenProps } from "@/navigation/rootStackTypes";
import { Body, H2, H3, Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useUserQuery } from "../user/users.hooks";
import { useTheme } from "styled-components/native";

export function FieldCalendarExportSuccessScreen({
  navigation,
}: FieldCalendarExportSuccessScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={() =>
              navigation.reset({
                index: 1,
                routes: [{ name: "Home" }, { name: "FieldCalendar" }],
              })
            }
            title={t("buttons.finish")}
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("reports.field_calendar.export_success_heading")}</H2>
      <H3 style={{ marginTop: theme.spacing.xl }}>
        {t("reports.field_calendar.export_sent_to", { email: user?.email })}
      </H3>
      <H3 style={{ marginTop: theme.spacing.m }}>
        {t("reports.field_calendar.export_mail_being_deliverd")}
      </H3>
      <H3 style={{ marginTop: theme.spacing.m }}>
        {t("common.if_problem_contact_support")}
      </H3>
    </ContentView>
  );
}
