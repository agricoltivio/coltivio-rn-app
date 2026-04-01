import { Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

type WikiStatusBadgeProps = {
  status: string;
};

export function WikiStatusBadge({ status }: WikiStatusBadgeProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const bgColor =
    status === "submitted" || status === "under_review"
      ? theme.colors.blue
      : status === "draft" || status === "changes_requested"
        ? theme.colors.amber
        : status === "approved"
          ? theme.colors.success
          : status === "rejected"
            ? theme.colors.danger
            : theme.colors.gray4;

  const statusLabels: Record<string, string> = {
    draft: t("wiki.status.draft"),
    changes_requested: t("wiki.changes_requested"),
    submitted: t("wiki.status.submitted"),
    under_review: t("wiki.status.under_review"),
    published: t("wiki.status.published"),
    approved: t("wiki.status.approved"),
    rejected: t("wiki.status.rejected"),
  };
  const label = statusLabels[status] ?? status;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: theme.radii.s,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xxs,
        marginRight: theme.spacing.xs,
      }}
    >
      <Subtitle style={{ color: theme.colors.white, fontSize: 11 }}>
        {label}
      </Subtitle>
    </View>
  );
}
