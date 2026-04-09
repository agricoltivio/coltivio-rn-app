import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import {
  EditablePreviewRow,
  TvdImportRowDetailScreenProps,
} from "./navigation/animals-routes";

type RowFormValues = {
  earTagNumber: string;
  name: string;
  sex: "male" | "female";
  dateOfBirth: Date;
  usage: "milk" | "other";
  motherEarTagNumber: string;
  fatherEarTagNumber: string;
  dateOfDeath: Date | undefined;
  deathReason: "died" | "slaughtered" | undefined;
};

export function TvdImportRowDetailScreen({
  route,
  navigation,
}: TvdImportRowDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowIndex, row, type } = route.params;
  const { animals } = useAnimalsQuery();

  const [mergeAnimalId, setMergeAnimalId] = useState<string | null>(
    row.mergeAnimalId,
  );

  // Handle merge animal selection coming back from SelectSingleAnimalModal
  useEffect(() => {
    const sel = route.params.mergeSelection;
    if (sel && sel.rowIndex === rowIndex) {
      setMergeAnimalId(sel.animalId);
    }
  }, [route.params.mergeSelection, rowIndex]);

  const mergeAnimal = mergeAnimalId
    ? animals?.find((a) => a.id === mergeAnimalId)
    : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RowFormValues>({
    defaultValues: {
      earTagNumber: row.earTagNumber ?? "",
      name: row.name ?? "",
      sex: row.sex ?? undefined,
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
      usage: row.usage ?? undefined,
      motherEarTagNumber: row.motherEarTagNumber ?? "",
      fatherEarTagNumber: row.fatherEarTagNumber ?? "",
      dateOfDeath: row.dateOfDeath ? new Date(row.dateOfDeath) : undefined,
      deathReason:
        row.deathReason ?? (row.dateOfDeath ? "died" : undefined) ?? undefined,
    },
  });

  function onSave(values: RowFormValues) {
    const updatedRow: EditablePreviewRow = {
      ...row,
      earTagNumber: values.earTagNumber || null,
      name: values.name || null,
      sex: values.sex,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
      usage: values.usage,
      motherEarTagNumber: values.motherEarTagNumber || null,
      fatherEarTagNumber: values.fatherEarTagNumber || null,
      dateOfDeath: values.dateOfDeath ? values.dateOfDeath.toISOString() : null,
      deathReason: values.dateOfDeath ? (values.deathReason ?? "died") : null,
      mergeAnimalId,
    };
    navigation.popTo(
      "TvdImportPreview",
      { rowEdit: { rowIndex, updatedRow } },
      { merge: true },
    );
  }

  const sexData = [
    { label: t("animals.sex.male"), value: "male" },
    { label: t("animals.sex.female"), value: "female" },
  ];

  const usageData = [
    { label: t("animals.usage_types.milk"), value: "milk" },
    { label: t("animals.usage_types.other"), value: "other" },
  ];

  const title = row.name ?? t("animals.tvd_import.row_detail_title");

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button title={t("buttons.save")} onPress={handleSubmit(onSave)} />
        </BottomActionContainer>
      }
    >
      <ScrollView headerTitleOnScroll={title} showHeaderOnScroll>
        <H2>{title}</H2>

        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.m }}>
          {/* Parse errors from backend */}
          {row.parseErrors.length > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.danger,
              }}
            >
              {row.parseErrors.map((err: string, i: number) => (
                <Subtitle key={i} style={{ color: theme.colors.danger }}>
                  {err}
                </Subtitle>
              ))}
            </View>
          )}

          <RHTextInput
            name="name"
            control={control}
            label={t("forms.labels.name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />

          <RHTextInput
            name="earTagNumber"
            control={control}
            label={t("ear_tags.ear_tag")}
          />

          <RHSelect
            name="sex"
            control={control}
            label={t("forms.labels.sex")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.sex?.message}
            data={sexData}
          />

          <RHDatePicker
            name="dateOfBirth"
            control={control}
            label={t("animals.date_of_birth")}
            mode="date"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.dateOfBirth?.message}
          />

          <RHSelect
            name="usage"
            control={control}
            label={t("animals.usage")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.usage?.message}
            data={usageData}
          />

          <RHTextInput
            name="motherEarTagNumber"
            control={control}
            label={t("animals.mother_ear_tag_number")}
          />

          <RHTextInput
            name="fatherEarTagNumber"
            control={control}
            label={t("animals.father_ear_tag_number")}
          />

          <RHDatePicker
            name="dateOfDeath"
            control={control}
            label={t("animals.date_of_death")}
            mode="date"
          />

          <RHSelect
            name="deathReason"
            control={control}
            label={t("animals.death_reason")}
            data={[
              { label: t("animals.death_reasons.died"), value: "died" },
              {
                label: t("animals.death_reasons.slaughtered"),
                value: "slaughtered",
              },
            ]}
          />

          {/* Merge section — always visible */}
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
              borderLeftWidth: row.earTagAssigned ? 4 : 0,
              borderLeftColor: theme.colors.warning,
              marginTop: theme.spacing.s,
            }}
          >
            {row.earTagAssigned && (
              <Subtitle
                style={{
                  color: theme.colors.warning,
                  marginBottom: theme.spacing.s,
                }}
              >
                {t("animals.tvd_import.ear_tag_assigned_warning")}
              </Subtitle>
            )}

            {mergeAnimal ? (
              <View>
                <Subtitle>
                  {t("animals.tvd_import.merge_animal_set", {
                    name: mergeAnimal.name,
                  })}
                </Subtitle>
                <TouchableOpacity
                  onPress={() => setMergeAnimalId(null)}
                  style={{ marginTop: theme.spacing.xs }}
                >
                  <Subtitle
                    style={{
                      color: theme.colors.primary,
                      textDecorationLine: "underline",
                    }}
                  >
                    {t("animals.tvd_import.clear_merge")}
                  </Subtitle>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                type="secondary"
                title={t("animals.tvd_import.assign_merge_animal")}
                onPress={() =>
                  navigation.navigate("SelectSingleAnimal", {
                    animalType: type,
                    previousScreen: "TvdImportRowDetail",
                    rowIndex,
                  })
                }
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ContentView>
  );
}
