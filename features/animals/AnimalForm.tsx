import { AnimalCreateInput } from "@/api/animals.api";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { Switch } from "@/components/inputs/Switch";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { IonIconButton } from "@/components/buttons/IconButton";
import { Ionicons } from "@expo/vector-icons";
import {
  Control,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { Subtitle } from "@/theme/Typography";
import { useAnimalsQuery } from "./animals.hooks";
import { useAvailableEarTagsQuery } from "./earTags.hooks";
import { useHerdsQuery } from "./herds.hooks";

export type AnimalFormValues = Omit<
  AnimalCreateInput,
  "dateOfBirth" | "dateOfDeath"
> & {
  dateOfBirth: Date;
  dateOfDeath?: Date;
};

type AnimalFormProps = {
  control: Control<AnimalFormValues>;
  errors: FieldErrors<AnimalFormValues>;
  setValue: UseFormSetValue<AnimalFormValues>;
  earTagData?: { label: string; value: string }[];
  showDeathFields?: boolean;
  requiresCategoryOverride?: boolean | null;
  onNavigateToCreateHerd?: () => void;
};

export function AnimalForm({
  control,
  errors,
  setValue,
  earTagData,
  showDeathFields,
  requiresCategoryOverride,
  onNavigateToCreateHerd,
}: AnimalFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animals } = useAnimalsQuery(true);
  const { availableEarTags } = useAvailableEarTagsQuery();
  const { herds } = useHerdsQuery();

  // Watch dateOfDeath to conditionally show deathReason
  const dateOfDeath = useWatch({ control, name: "dateOfDeath" });
  const categoryOverride = useWatch({ control, name: "categoryOverride" });

  const animalTypeData = [
    { label: t("animals.animal_types.goat"), value: "goat" },
    { label: t("animals.animal_types.sheep"), value: "sheep" },
    { label: t("animals.animal_types.cow"), value: "cow" },
    { label: t("animals.animal_types.horse"), value: "horse" },
    { label: t("animals.animal_types.donkey"), value: "donkey" },
    { label: t("animals.animal_types.pig"), value: "pig" },
    { label: t("animals.animal_types.deer"), value: "deer" },
  ];

  const sexData = [
    { label: t("animals.sex.male"), value: "male" },
    { label: t("animals.sex.female"), value: "female" },
  ];

  const deathReasonData = [
    { label: t("animals.death_reasons.died"), value: "died" },
    { label: t("animals.death_reasons.slaughtered"), value: "slaughtered" },
  ];

  const usageData = [
    { label: t("animals.usage_types.milk"), value: "milk" },
    { label: t("animals.usage_types.other"), value: "other" },
  ];

  const categoryOverrideData = [
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
    "A9",
    "B1",
    "B2",
    "B3",
    "C1",
    "C2",
    "D1",
    "D2",
    "D3",
    "E1",
    "E2",
    "E3",
    "E4",
    "F1",
    "F2",
  ].map((val) => ({ label: val, value: val }));

  const herdData =
    herds?.map((herd) => ({
      label: herd.name,
      value: herd.id,
    })) ?? [];

  // Show override controls when server says override is required OR when user has already set one
  const showCategoryOverride =
    true || requiresCategoryOverride || categoryOverride != null;

  // Use provided earTagData (for edit screen with current tag) or available ear tags
  const earTagSelectData =
    earTagData ??
    availableEarTags?.map((earTag) => ({
      label: earTag.number,
      value: earTag.id,
    })) ??
    [];

  const femaleAnimals =
    animals
      ?.filter((animal) => animal.sex === "female")
      .map((animal) => ({
        label: animal.name,
        value: animal.id,
      })) ?? [];

  const maleAnimals =
    animals
      ?.filter((animal) => animal.sex === "male")
      .map((animal) => ({
        label: animal.name,
        value: animal.id,
      })) ?? [];

  return (
    <View
      style={{ gap: theme.spacing.xs, flex: 1, marginTop: theme.spacing.m }}
    >
      <RHTextInput
        name="name"
        control={control}
        label={t("forms.labels.name")}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.name?.message}
      />
      <RHSelect
        name="type"
        control={control}
        label={t("forms.labels.type")}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.type?.message}
        data={animalTypeData}
      />
      <RHSelect
        name="earTagId"
        control={control}
        label={t("ear_tags.ear_tag")}
        data={earTagSelectData}
        enableSearch
        error={errors.earTagId?.message}
      />
      <RHSelect
        name="sex"
        control={control}
        label={t("forms.labels.sex")}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.sex?.message}
        data={sexData}
      />
      <RHDatePicker
        name="dateOfBirth"
        control={control}
        label={t("animals.date_of_birth")}
        mode="date"
        error={errors.dateOfBirth?.message}
      />
      <RHSwitch
        style={{ marginTop: theme.spacing.m, marginBottom: theme.spacing.m }}
        name="registered"
        control={control}
        label={t("animals.registered")}
      />
      <RHSelect
        name="usage"
        control={control}
        label={t("animals.usage")}
        rules={{
          required: { value: true, message: t("forms.validation.required") },
        }}
        error={errors.usage?.message}
        data={usageData}
      />
      {showCategoryOverride && (
        <>
          {/* Yellow info box when auto-category failed */}
          {requiresCategoryOverride && (
            <View
              style={{
                marginTop: theme.spacing.m,
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.yellow,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.xs,
              }}
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color={theme.colors.yellow}
              />
              <Subtitle style={{ flex: 1 }}>
                {t("animals.category_override_info")}
              </Subtitle>
            </View>
          )}
          {/* Inverted switch: ON = auto category, OFF = manual override */}
          <Switch
            style={{
              marginTop: theme.spacing.m,
              marginBottom: theme.spacing.xs,
            }}
            value={categoryOverride == null}
            onChange={() => {
              if (categoryOverride == null) {
                // Switching to manual
                setValue("categoryOverride", "A1", { shouldDirty: true });
              } else {
                // Switching to auto
                setValue("categoryOverride", null, { shouldDirty: true });
              }
            }}
            label={t("animals.auto_category")}
          />
          {categoryOverride != null && (
            <RHSelect
              name="categoryOverride"
              control={control}
              label={t("animals.category")}
              data={categoryOverrideData}
              error={errors.categoryOverride?.message}
            />
          )}
        </>
      )}
      {/* Herd select with + button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.xs,
        }}
      >
        <View style={{ flex: 1 }}>
          <RHSelect
            name="herdId"
            control={control}
            label={t("animals.herd")}
            data={herdData}
            error={errors.herdId?.message}
          />
        </View>
        {onNavigateToCreateHerd && (
          <IonIconButton
            icon="add"
            color="black"
            iconSize={25}
            type="accent"
            onPress={onNavigateToCreateHerd}
          />
        )}
      </View>
      <RHSelect
        name="motherId"
        control={control}
        label={t("animals.mother")}
        data={femaleAnimals}
        enableSearch
        error={errors.motherId?.message}
      />
      <RHSelect
        name="fatherId"
        control={control}
        label={t("animals.father")}
        data={maleAnimals}
        enableSearch
        error={errors.fatherId?.message}
      />
      {showDeathFields && (
        <>
          <RHDatePicker
            name="dateOfDeath"
            control={control}
            label={t("animals.date_of_death")}
            mode="date"
            error={errors.dateOfDeath?.message}
          />
          {dateOfDeath && (
            <RHSelect
              name="deathReason"
              control={control}
              label={t("animals.death_reason")}
              data={deathReasonData}
              error={errors.deathReason?.message}
            />
          )}
        </>
      )}
    </View>
  );
}
