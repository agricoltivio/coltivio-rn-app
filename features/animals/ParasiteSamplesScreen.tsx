import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { ParasiteSamplesScreenProps } from "./navigation/animals-routes";
import { animalDisplayName } from "./ParasiteCharts";
import { ParasiteResultsEditor } from "./ParasiteResultsEditor";
import {
  filledResults,
  ParasiteSampleMode,
  useParasiteSampleDraftStore,
} from "./parasite-sample-draft.store";

const SAMPLE_MODES: ParasiteSampleMode[] = ["pooled", "individual"];

export function ParasiteSamplesScreen({
  route,
  navigation,
}: ParasiteSamplesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const animalIds: string[] = route.params.animalIds;
  const { animals } = useAnimalsQuery();
  const draft = useParasiteSampleDraftStore();

  const checkAnimals = useMemo(() => {
    const animalsById = new Map<string, AnimalWithWaitingTimeFlag>(
      (animals ?? []).map((animal) => [animal.id, animal]),
    );
    return animalIds.flatMap((animalId) => {
      const animal = animalsById.get(animalId);
      return animal ? [animal] : [];
    });
  }, [animals, animalIds]);

  const title = t("parasite_checks.record_results");

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.finish")}
            onPress={() => navigation.goBack()}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title} keyboardAware>
        <H2>{title}</H2>

        {/* Sample type */}
        <View
          style={{
            flexDirection: "row",
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: 4,
          }}
        >
          {SAMPLE_MODES.map((modeOption) => (
            <TouchableOpacity
              key={modeOption}
              onPress={() => draft.setMode(modeOption)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor:
                  draft.mode === modeOption ? theme.colors.primary : undefined,
              }}
            >
              <Subtitle
                style={{
                  color:
                    draft.mode === modeOption
                      ? theme.colors.white
                      : theme.colors.gray1,
                  fontWeight: "600",
                }}
              >
                {t(`parasite_checks.sample_modes.${modeOption}`)}
              </Subtitle>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: theme.spacing.m }}>
          <TextInput
            label={t("parasite_checks.lab_name_optional")}
            value={draft.labName}
            onChangeText={draft.setLabName}
          />
        </View>

        {draft.mode === "pooled" ? (
          <View style={{ marginTop: theme.spacing.l, gap: theme.spacing.xs }}>
            <H3>{t("parasite_checks.sample_modes.pooled")}</H3>
            <Subtitle style={{ color: theme.colors.gray2, fontSize: 13 }}>
              {t("parasite_checks.pooled_info", {
                count: animalIds.length,
              })}
            </Subtitle>
            <TextInput
              label={t("parasite_checks.sample_label")}
              value={draft.pooledLabel}
              onChangeText={draft.setPooledLabel}
            />
            <ParasiteResultsEditor
              results={draft.pooledResults}
              onChange={draft.setPooledResults}
            />
          </View>
        ) : (
          <View style={{ marginTop: theme.spacing.l }}>
            <H3>{t("animals.animals")}</H3>
            <Subtitle
              style={{ color: theme.colors.gray2, fontSize: 13, marginTop: 4 }}
            >
              {t("parasite_checks.individual_info")}
            </Subtitle>
            <View
              style={{
                marginTop: theme.spacing.s,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {checkAnimals.map((animal) => {
                const resultCount = filledResults(
                  draft.individualResults[animal.id],
                ).length;
                return (
                  <ListItem
                    key={animal.id}
                    style={{ paddingVertical: 5 }}
                    onPress={() =>
                      navigation.navigate("ParasiteAnimalSample", {
                        animalId: animal.id,
                      })
                    }
                  >
                    <ListItem.Content>
                      <ListItem.Title>
                        {animalDisplayName(animal.name, animal.earTag?.number)}
                      </ListItem.Title>
                      {resultCount > 0 && (
                        <ListItem.Body>
                          {t("parasite_checks.n_results", {
                            count: resultCount,
                          })}
                        </ListItem.Body>
                      )}
                    </ListItem.Content>
                    {resultCount > 0 && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={theme.colors.success}
                      />
                    )}
                    <ListItem.Chevron />
                  </ListItem>
                );
              })}
            </View>
          </View>
        )}
        <View style={{ height: theme.spacing.l }} />
      </ScrollView>
    </ContentView>
  );
}
