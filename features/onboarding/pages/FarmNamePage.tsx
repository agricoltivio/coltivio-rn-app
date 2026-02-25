import { TextInput } from "@/components/inputs/TextInput";
import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

type FarmNamePageProps = {
  name: string;
  onNameChange: (value: string) => void;
};

export function FarmNamePage({ name, onNameChange }: FarmNamePageProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ width: "100%" }}>
      <H1 style={{ color: theme.colors.primary }}>
        {t("onboarding.farm_name.heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("onboarding.farm_name.subheading")}
      </H3>
      <View style={{ flexGrow: 1, paddingVertical: theme.spacing.xl }}>
        <TextInput
          label={t("forms.labels.farm_name")}
          value={name}
          onChangeText={onNameChange}
        />
      </View>
    </View>
  );
}
