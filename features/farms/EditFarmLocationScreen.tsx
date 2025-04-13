import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { EditFarmLocationScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "./farms.hooks";
import { useTranslation } from "react-i18next";

export function EditFarmLocationScreen({
  navigation,
}: EditFarmLocationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();

  return (
    <ContentView>
      <H2>{t("forms.labels.location")}</H2>
      <View style={{ flex: 1, marginTop: theme.spacing.m }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("SearchFarmLocation");
          }}
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
