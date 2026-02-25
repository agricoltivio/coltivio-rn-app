import { TextInput } from "@/components/inputs/TextInput";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

type FarmLocationPageProps = {
  farmName: string;
  locationLabel: string | undefined;
  onOpenSearchModal: () => void;
};

export function FarmLocationPage({
  farmName,
  locationLabel,
  onOpenSearchModal,
}: FarmLocationPageProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ width: "100%" }}>
      <H2 style={{ color: theme.colors.primary }}>
        {t("onboarding.location.heading", { farmName })}
      </H2>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("onboarding.location.subheading")}
      </H3>
      <View style={{ marginVertical: theme.spacing.xl, flex: 1 }}>
        <TouchableOpacity onPress={onOpenSearchModal}>
          <TextInput
            placeholder={t("forms.placeholders.location_search")}
            pointerEvents="none"
            label={t("forms.labels.location")}
            value={locationLabel}
            disabled
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
