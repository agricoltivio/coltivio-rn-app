import { AnimalType } from "@/api/animals.api";
import { useApi } from "@/api/api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3 } from "@/theme/Typography";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { TvdImportScreenProps } from "./navigation/animals-routes";

type SelectedFile = { uri: string; name: string; mimeType?: string };

export function TvdImportScreen({ navigation }: TvdImportScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi();
  const { localSettings } = useLocalSettings();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!localSettings.tvdImportOnboardingCompleted) {
      navigation.replace("TvdImportOnboarding");
    }
  }, []);
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
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
    }
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
    } catch {
      const fileForSharing = selectedFile;
      const sharingAvailable =
        fileForSharing !== null && (await Sharing.isAvailableAsync());

      Alert.alert(
        t("common.error"),
        sharingAvailable
          ? `${t("common.unknown_error")}\n\n${t("animals.tvd_import.error_report_prompt")}`
          : t("common.unknown_error"),
        sharingAvailable
          ? [
              {
                text: t("animals.tvd_import.send_file"),
                onPress: () =>
                  Sharing.shareAsync(fileForSharing.uri, {
                    mimeType:
                      fileForSharing.mimeType ??
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: fileForSharing.name,
                  }),
              },
              { text: t("buttons.ok"), style: "cancel" },
            ]
          : undefined,
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
