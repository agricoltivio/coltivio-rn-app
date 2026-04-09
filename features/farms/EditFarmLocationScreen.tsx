import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { EditFarmLocationScreenProps } from "./navigation/farm-routes";
import { H2 } from "@/theme/Typography";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "./farms.hooks";
import { useTranslation } from "react-i18next";
import { useUserQuery } from "@/features/user/users.hooks";

export function EditFarmLocationScreen({
  navigation,
}: EditFarmLocationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { user } = useUserQuery();
  const isOwner = user?.farmRole === "owner";

  return (
    <ContentView>
      <H2>{t("forms.labels.location")}</H2>
      <View style={{ flex: 1, marginTop: theme.spacing.m }}>
        <TouchableOpacity
          onPress={() => {
            if (isOwner) navigation.navigate("SearchFarmLocation");
          }}
          disabled={!isOwner}
        >
          <TextInput
            placeholder={t("forms.placeholders.location_search")}
            label={t("forms.labels.location")}
            value={farm?.address}
            pointerEvents="none"
            disabled
          />
        </TouchableOpacity>
      </View>
    </ContentView>
  );
}
