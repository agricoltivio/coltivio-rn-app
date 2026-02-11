import { AnimalType } from "@/api/animals.api";
import { useApi } from "@/api/api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3 } from "@/theme/Typography";
// TODO: re-enable after rebuild with expo-document-picker
// import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";

type SelectedFile = { uri: string; name: string; mimeType?: string };

export function TvdImportScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [animalType, setAnimalType] = useState<AnimalType | null>(null);
  const [loading, setLoading] = useState(false);

  const animalTypeData = [
    { label: t("animals.animal_types.goat"), value: "goat" },
    { label: t("animals.animal_types.sheep"), value: "sheep" },
    { label: t("animals.animal_types.cow"), value: "cow" },
    { label: t("animals.animal_types.horse"), value: "horse" },
    { label: t("animals.animal_types.donkey"), value: "donkey" },
    { label: t("animals.animal_types.pig"), value: "pig" },
    { label: t("animals.animal_types.deer"), value: "deer" },
  ];

  async function handlePickFile() {
    // TODO: re-enable after rebuild with expo-document-picker
    // const result = await DocumentPicker.getDocumentAsync({
    //   type: [
    //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //     "application/vnd.ms-excel",
    //   ],
    //   copyToCacheDirectory: true,
    // });
    // if (!result.canceled && result.assets.length > 0) {
    //   setSelectedFile(result.assets[0]);
    // }
    Alert.alert("TODO", "Rebuild required for expo-document-picker");
  }

  async function handleImport() {
    if (!selectedFile || !animalType) return;

    setLoading(true);
    try {
      const filePayload = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type:
          selectedFile.mimeType ??
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      } as unknown as string; // FormData expects this shape on React Native

      const result = await api.animals.importAnimals({
        file: filePayload,
        type: animalType,
        skipHeaderRow: "true",
      });

      const { summary, skipped } = result;
      let message = t("animals.tvd_import.success_message", {
        imported: summary.imported,
        total: summary.totalRows,
      });
      if (skipped.length > 0) {
        message +=
          "\n\n" +
          t("animals.tvd_import.skipped_message", {
            count: summary.skipped,
          });
      }

      Alert.alert(t("animals.tvd_import.success_title"), message);
      setSelectedFile(null);
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error instanceof Error ? error.message : t("common.unknown_error"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("animals.tvd_import.import_button")}
            onPress={handleImport}
            disabled={!selectedFile || !animalType || loading}
            loading={loading}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        headerTitleOnScroll={t("animals.tvd_import.title")}
        showHeaderOnScroll
      >
        <H2>{t("animals.tvd_import.title")}</H2>

        <H3 style={{ color: theme.colors.gray1, marginTop: theme.spacing.s }}>
          {t("animals.tvd_import.experimental")}
        </H3>

        <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.l }}>
          {t("animals.tvd_import.instructions")}
        </H3>

        <View style={{ marginTop: theme.spacing.l }}>
          <Select
            label={t("forms.labels.type")}
            data={animalTypeData}
            value={animalType ?? undefined}
            onChange={(value) => setAnimalType(value as AnimalType)}
          />
        </View>

        <View style={{ marginTop: theme.spacing.l }}>
          <Button
            type="secondary"
            title={
              selectedFile
                ? selectedFile.name
                : t("animals.tvd_import.select_file")
            }
            onPress={handlePickFile}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
