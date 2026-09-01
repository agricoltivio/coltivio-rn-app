import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";

export function useFarmRoleUi() {
  const { t } = useTranslation();
  const theme = useTheme();

  const roleColors: Record<"owner" | "member", { bg: string; text: string }> =
    {
      owner: { bg: theme.colors.primary + "22", text: theme.colors.primary },
      member: { bg: theme.colors.gray4, text: theme.colors.gray1 },
    };
  const roleLabels: Record<"owner" | "member", string> = {
    owner: t("farm.role_owner"),
    member: t("farm.role_member"),
  };

  return { roleColors, roleLabels };
}
