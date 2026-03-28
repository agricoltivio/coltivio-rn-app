import { TaskCreateInput, TaskDetail, TaskUpdateInput } from "@/api/tasks.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RecurrenceValue } from "@/components/recurrence/RecurrencePicker";
import { RecurrencePickerModal } from "@/components/recurrence/RecurrencePickerModal";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { Chip } from "@/components/chips/Chip";
import { ListItem } from "@/components/list/ListItem";
import { TextInput } from "@/components/inputs/TextInput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useCreateTaskMutation,
  useFarmUsersQuery,
  useTaskDetailQuery,
  useUpdateTaskMutation,
} from "./tasks.hooks";
import { TaskFormScreenProps } from "./navigation/tasks-routes";
import { AnimalType } from "@/api/animals.api";
import { useAnimalsQuery } from "@/features/animals/animals.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { useHerdsQuery } from "@/features/animals/herds.hooks";
import { useMyWikiEntriesQuery } from "@/features/wiki/wiki.hooks";

type LinkInput = {
  linkType:
    | "animal"
    | "plot"
    | "contact"
    | "order"
    | "wiki_entry"
    | "treatment"
    | "herd";
  linkedId: string;
  displayName: string;
};

type ChecklistItemInput = {
  name: string;
  dueDate?: string;
};

type FormValues = {
  name: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date | null;
  checklistItems: ChecklistItemInput[];
};

// Entity type options for link picker modal — "animal" covers both animals + herds via a sub-toggle
const ENTITY_TYPES = ["animal", "plot", "wiki_entry"] as const;
type EntityType = (typeof ENTITY_TYPES)[number];
type AllLinkType = LinkInput["linkType"];

// Which sub-view is active when entityType === "animal"
type AnimalSubView = "animals" | "herds";

type LinkPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (links: LinkInput[]) => void;
  /** Pre-filter to this entity type and skip step 1 (edit mode) */
  initialEntityType?: EntityType | null;
  /** Only relevant when initialEntityType === "animal" */
  initialAnimalSubView?: AnimalSubView;
  /** Pre-selected links shown as checked (edit mode) */
  initialSelectedLinks?: LinkInput[];
};

function LinkPickerModal({
  visible,
  onClose,
  onConfirm,
  initialEntityType,
  initialAnimalSubView,
  initialSelectedLinks,
}: LinkPickerModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Step 1: choose entity type. Step 2: browse + multi-select entities.
  const [step, setStep] = useState<"type_select" | "entity_list">(
    "type_select",
  );
  const [entityType, setEntityType] = useState<EntityType | null>(null);
  const [animalSubView, setAnimalSubView] = useState<AnimalSubView>("animals");
  const [search, setSearch] = useState("");
  const [selectedAnimalTypes, setSelectedAnimalTypes] = useState<
    Set<AnimalType>
  >(new Set());
  // Tracks items selected in the current picker session, keyed by linkedId
  const [pendingLinks, setPendingLinks] = useState<Map<string, LinkInput>>(
    new Map(),
  );

  const { animals } = useAnimalsQuery(false, undefined, visible);
  const { plots } = useFarmPlotsQuery();
  const { herds } = useHerdsQuery();
  const { myEntries: wikiEntries } = useMyWikiEntriesQuery();

  // Initialize state whenever the modal opens
  useEffect(() => {
    if (!visible) return;
    const map = new Map<string, LinkInput>();
    for (const link of initialSelectedLinks ?? []) {
      map.set(link.linkedId, link);
    }
    setPendingLinks(map);
    setSearch("");
    setSelectedAnimalTypes(new Set());
    if (initialEntityType != null) {
      setEntityType(initialEntityType);
      setAnimalSubView(initialAnimalSubView ?? "animals");
      setStep("entity_list");
    } else {
      setEntityType(null);
      setAnimalSubView("animals");
      setStep("type_select");
    }
  }, [visible]); // intentionally only on visibility change

  // Unique animal types present in the data, for filter chips
  const availableAnimalTypes: AnimalType[] = useMemo(() => {
    const seen = new Set<AnimalType>();
    for (const a of animals ?? []) {
      if (!a.dateOfDeath) seen.add(a.type);
    }
    return Array.from(seen).sort();
  }, [animals]);

  // Filtered + searched animals (living only)
  const filteredAnimals = useMemo(() => {
    let result = (animals ?? []).filter((a) => !a.dateOfDeath);
    if (selectedAnimalTypes.size > 0) {
      result = result.filter((a) => selectedAnimalTypes.has(a.type));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.earTag?.number ?? "").toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [animals, selectedAnimalTypes, search]);

  // Filtered + searched herds
  const filteredHerds = useMemo(() => {
    const q = search.toLowerCase();
    return (herds ?? []).filter(
      (h) => !search || h.name.toLowerCase().includes(q),
    );
  }, [herds, search]);

  // Filtered + searched plots
  const filteredPlots = useMemo(() => {
    const q = search.toLowerCase();
    return (plots ?? []).filter(
      (p) => !search || (p.name ?? "").toLowerCase().includes(q),
    );
  }, [plots, search]);

  // Filtered + searched wiki entries
  const filteredWikiEntries = useMemo(() => {
    const q = search.toLowerCase();
    return (wikiEntries ?? []).filter((e) => {
      const translation =
        e.translations.find((tr) => tr.locale === "de") ?? e.translations[0];
      return !search || (translation?.title ?? "").toLowerCase().includes(q);
    });
  }, [wikiEntries, search]);

  function handleClose() {
    onClose();
  }

  function handleEntityTypeSelect(type: EntityType) {
    setEntityType(type);
    setSearch("");
    setSelectedAnimalTypes(new Set());
    setAnimalSubView("animals");
    setStep("entity_list");
  }

  function handleBack() {
    setStep("type_select");
    setSearch("");
    setSelectedAnimalTypes(new Set());
  }

  // All visible items in the current entity list view, for select all / clear
  const currentItems: LinkInput[] = useMemo(() => {
    if (entityType === "animal" && animalSubView === "animals") {
      return filteredAnimals.map((a) => ({
        linkType: "animal" as AllLinkType,
        linkedId: a.id,
        displayName: a.name,
      }));
    }
    if (entityType === "animal" && animalSubView === "herds") {
      return filteredHerds.map((h) => ({
        linkType: "herd" as AllLinkType,
        linkedId: h.id,
        displayName: h.name,
      }));
    }
    if (entityType === "plot") {
      return filteredPlots.map((p) => ({
        linkType: "plot" as AllLinkType,
        linkedId: p.id,
        displayName: p.name ?? p.id,
      }));
    }
    if (entityType === "wiki_entry") {
      return filteredWikiEntries.map((e) => {
        const translation =
          e.translations.find((tr) => tr.locale === "de") ?? e.translations[0];
        return {
          linkType: "wiki_entry" as AllLinkType,
          linkedId: e.id,
          displayName: translation?.title ?? e.id,
        };
      });
    }
    return [];
  }, [
    entityType,
    animalSubView,
    filteredAnimals,
    filteredHerds,
    filteredPlots,
    filteredWikiEntries,
  ]);

  function handleSelectAll() {
    setPendingLinks((prev) => {
      const next = new Map(prev);
      for (const item of currentItems) next.set(item.linkedId, item);
      return next;
    });
  }

  function handleClearAll() {
    setPendingLinks((prev) => {
      const next = new Map(prev);
      for (const item of currentItems) next.delete(item.linkedId);
      return next;
    });
  }

  function toggleItem(
    linkType: AllLinkType,
    linkedId: string,
    displayName: string,
  ) {
    setPendingLinks((prev) => {
      const next = new Map(prev);
      if (next.has(linkedId)) {
        next.delete(linkedId);
      } else {
        next.set(linkedId, { linkType, linkedId, displayName });
      }
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(pendingLinks.values()));
  }

  function toggleAnimalType(type: AnimalType) {
    setSelectedAnimalTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  const entityTypeLabels: Record<EntityType, string> = {
    animal: t("tasks.link_types.animal"),
    plot: t("tasks.link_types.plot"),
    wiki_entry: t("tasks.link_types.wiki_entry"),
  };

  const entityTypePluralLabels: Record<EntityType, string> = {
    animal: t("tasks.link_types.animal_plural"),
    plot: t("tasks.link_types.plot_plural"),
    wiki_entry: t("tasks.link_types.wiki_entry_plural"),
  };

  const ANIMAL_TYPE_LABELS: Record<AnimalType, string> = {
    goat: t("animals.animal_types.goat"),
    sheep: t("animals.animal_types.sheep"),
    cow: t("animals.animal_types.cow"),
    horse: t("animals.animal_types.horse"),
    donkey: t("animals.animal_types.donkey"),
    pig: t("animals.animal_types.pig"),
    deer: t("animals.animal_types.deer"),
  };

  const entityTypeIcons: Record<EntityType, keyof typeof Ionicons.glyphMap> = {
    animal: "paw-outline",
    plot: "leaf-outline",
    wiki_entry: "book-outline",
  };

  // Confirm button count label matches SelectAnimalsModal pattern
  const selectedCount = pendingLinks.size;

  // Fake navigation header matching the stack navigator's header height
  const navHeader = (button: React.ReactNode) => (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          height: 44,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
        }}
      >
        {button}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      {/* Step 1 — entity type selection */}
      {step === "type_select" && (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {navHeader(
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Pressable
                onPress={handleClose}
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <Ionicons name="close" size={28} color={theme.colors.primary} />
              </Pressable>
            </View>,
          )}
          <View
            style={{
              flex: 1,
              paddingHorizontal: theme.spacing.m,
              paddingTop: theme.spacing.s,
            }}
          >
            <H2>{t("tasks.add_link")}</H2>
            <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
              {ENTITY_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => handleEntityTypeSelect(type)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.m,
                    backgroundColor: theme.colors.gray5,
                    borderRadius: theme.radii.m,
                    padding: theme.spacing.m,
                  }}
                >
                  <Ionicons
                    name={entityTypeIcons[type]}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Subtitle style={{ fontSize: 16 }}>
                    {entityTypeLabels[type]}
                  </Subtitle>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.gray2}
                    style={{ marginLeft: "auto" }}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Step 2 — entity list (multi-select), mirrors SelectAnimalsModal layout */}
      {step === "entity_list" && entityType != null && (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {navHeader(
            initialEntityType == null ? (
              <Pressable
                onPress={handleBack}
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={theme.colors.primary}
                />
              </Pressable>
            ) : (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <Pressable
                  onPress={handleClose}
                  style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                >
                  <Ionicons
                    name="close"
                    size={28}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>
            ),
          )}
          <View
            style={{
              flex: 1,
              paddingHorizontal: theme.spacing.m,
              paddingTop: theme.spacing.s,
            }}
          >
            <H2>{entityTypePluralLabels[entityType]}</H2>

            {/* Search */}
            <View style={{ marginTop: theme.spacing.m }}>
              <TextInput
                hideLabel
                placeholder={t("forms.placeholders.search")}
                onChangeText={setSearch}
                value={search}
              />
            </View>

            {/* Filter chips: sub-view toggle + animal type chips in one scroll row */}
            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: theme.spacing.s, flexGrow: 0 }}
              contentContainerStyle={{
                gap: theme.spacing.xs,
                paddingVertical: theme.spacing.xs,
              }}
            >
              {entityType === "animal" &&
                (["animals", "herds"] as AnimalSubView[]).map((view) => (
                  <Chip
                    key={view}
                    label={
                      view === "animals"
                        ? t("tasks.link_types.animal")
                        : t("tasks.link_types.herd")
                    }
                    active={animalSubView === view}
                    onPress={() => {
                      setAnimalSubView(view);
                      setSearch("");
                      setSelectedAnimalTypes(new Set());
                    }}
                  />
                ))}
              {entityType === "animal" &&
                animalSubView === "animals" &&
                availableAnimalTypes.map((animalType) => (
                  <Chip
                    key={animalType}
                    label={ANIMAL_TYPE_LABELS[animalType]}
                    active={selectedAnimalTypes.has(animalType)}
                    onPress={() => toggleAnimalType(animalType)}
                  />
                ))}
            </RNScrollView>

            {/* Select all / Clear */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: theme.spacing.m,
              }}
            >
              <TouchableOpacity onPress={handleSelectAll}>
                <Subtitle style={{ color: theme.colors.primary }}>
                  {t("treatments.select_all", { count: currentItems.length })}
                </Subtitle>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearAll}>
                <Subtitle style={{ color: theme.colors.gray1 }}>
                  {t("treatments.clear_selection")}
                </Subtitle>
              </TouchableOpacity>
            </View>

            {/* Entity list */}
            <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
              {entityType === "animal" && animalSubView === "animals" && (
                <FlatList
                  data={filteredAnimals}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                    overflow: "hidden",
                    backgroundColor:
                      filteredAnimals.length > 0
                        ? theme.colors.white
                        : undefined,
                  }}
                  renderItem={({ item }) => (
                    <ListItem
                      style={{ paddingVertical: 5 }}
                      onPress={() =>
                        toggleItem(
                          "animal",
                          item.id,
                          item.earTag?.number
                            ? `${item.earTag.number} — ${item.name}`
                            : item.name,
                        )
                      }
                    >
                      <ListItem.Checkbox checked={pendingLinks.has(item.id)} />
                      <ListItem.Content>
                        <ListItem.Title>
                          {item.earTag?.number
                            ? `${item.earTag.number} — `
                            : ""}
                          {item.name}
                        </ListItem.Title>
                        <ListItem.Body>
                          {ANIMAL_TYPE_LABELS[item.type]}
                        </ListItem.Body>
                      </ListItem.Content>
                    </ListItem>
                  )}
                />
              )}
              {entityType === "animal" && animalSubView === "herds" && (
                <FlatList
                  data={filteredHerds}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                    overflow: "hidden",
                    backgroundColor:
                      filteredHerds.length > 0 ? theme.colors.white : undefined,
                  }}
                  renderItem={({ item }) => (
                    <ListItem
                      style={{ paddingVertical: 5 }}
                      onPress={() => toggleItem("herd", item.id, item.name)}
                    >
                      <ListItem.Checkbox checked={pendingLinks.has(item.id)} />
                      <ListItem.Content>
                        <ListItem.Title>{item.name}</ListItem.Title>
                      </ListItem.Content>
                    </ListItem>
                  )}
                />
              )}
              {entityType === "plot" && (
                <FlatList
                  data={filteredPlots}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                    overflow: "hidden",
                    backgroundColor:
                      filteredPlots.length > 0 ? theme.colors.white : undefined,
                  }}
                  renderItem={({ item }) => (
                    <ListItem
                      style={{ paddingVertical: 5 }}
                      onPress={() =>
                        toggleItem("plot", item.id, item.name ?? item.id)
                      }
                    >
                      <ListItem.Checkbox checked={pendingLinks.has(item.id)} />
                      <ListItem.Content>
                        <ListItem.Title>{item.name ?? item.id}</ListItem.Title>
                      </ListItem.Content>
                    </ListItem>
                  )}
                />
              )}
              {entityType === "wiki_entry" && (
                <FlatList
                  data={filteredWikiEntries}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                    overflow: "hidden",
                    backgroundColor:
                      filteredWikiEntries.length > 0
                        ? theme.colors.white
                        : undefined,
                  }}
                  renderItem={({ item }) => {
                    const translation =
                      item.translations.find((tr) => tr.locale === "de") ??
                      item.translations[0];
                    const title = translation?.title ?? item.id;
                    return (
                      <ListItem
                        style={{ paddingVertical: 5 }}
                        onPress={() => toggleItem("wiki_entry", item.id, title)}
                      >
                        <ListItem.Checkbox
                          checked={pendingLinks.has(item.id)}
                        />
                        <ListItem.Content>
                          <ListItem.Title>{title}</ListItem.Title>
                        </ListItem.Content>
                      </ListItem>
                    );
                  }}
                />
              )}
            </View>
          </View>
          <BottomActionContainer>
            <Button
              title={t("treatments.confirm_selection", {
                count: selectedCount,
              })}
              onPress={handleConfirm}
            />
          </BottomActionContainer>
        </View>
      )}
    </Modal>
  );
}

type GenerateChecklistModalProps = {
  visible: boolean;
  items: LinkInput[];
  onClose: () => void;
  onConfirm: (selected: LinkInput[]) => void;
};

function GenerateChecklistModal({
  visible,
  items,
  onClose,
  onConfirm,
}: GenerateChecklistModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  // All pre-selected by default, keyed by linkedId
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    setSearch("");
    setSelected(new Set(items.map((i) => i.linkedId)));
  }, [visible]); // intentionally only on visibility change

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.displayName.toLowerCase().includes(q));
  }, [items, search]);

  function toggleItem(linkedId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(linkedId) ? next.delete(linkedId) : next.add(linkedId);
      return next;
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            paddingTop: insets.top,
            backgroundColor: theme.colors.background,
          }}
        >
          <View
            style={{
              height: 44,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              justifyContent: "flex-end",
            }}
          >
            <Pressable
              onPress={onClose}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <Ionicons name="close" size={28} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.s,
          }}
        >
          <H2>{t("tasks.checklist")}</H2>
          <View style={{ marginTop: theme.spacing.m }}>
            <TextInput
              hideLabel
              placeholder={t("forms.placeholders.search")}
              onChangeText={setSearch}
              value={search}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: theme.spacing.m,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setSelected(new Set(filtered.map((i) => i.linkedId)))
              }
            >
              <Subtitle style={{ color: theme.colors.primary }}>
                {t("treatments.select_all", { count: filtered.length })}
              </Subtitle>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  filtered.forEach((i) => next.delete(i.linkedId));
                  return next;
                })
              }
            >
              <Subtitle style={{ color: theme.colors.gray1 }}>
                {t("treatments.clear_selection")}
              </Subtitle>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.linkedId}
              contentContainerStyle={{
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                overflow: "hidden",
                backgroundColor:
                  filtered.length > 0 ? theme.colors.white : undefined,
              }}
              renderItem={({ item }) => (
                <ListItem
                  style={{ paddingVertical: 5 }}
                  onPress={() => toggleItem(item.linkedId)}
                >
                  <ListItem.Checkbox checked={selected.has(item.linkedId)} />
                  <ListItem.Content>
                    <ListItem.Title>{item.displayName}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              )}
            />
          </View>
        </View>
        <BottomActionContainer>
          <Button
            title={t("treatments.confirm_selection", { count: selected.size })}
            onPress={() =>
              onConfirm(items.filter((i) => selected.has(i.linkedId)))
            }
          />
        </BottomActionContainer>
      </View>
    </Modal>
  );
}

function ChecklistItemRow({
  value,
  onChangeText,
  onBlur,
  onSubmitEditing,
  blurOnSubmit = true,
  onRemove,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  onRemove?: () => void;
  placeholder?: string;
}) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  function handlePress() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleBlur() {
    setEditing(false);
    onBlur();
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Ionicons name="square-outline" size={22} color={theme.colors.gray3} />
      {editing ? (
        <RNTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray3}
          returnKeyType="done"
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing ?? handleBlur}
          style={{
            flex: 1,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primary,
            paddingVertical: 2,
            fontSize: 15,
            color: theme.colors.gray0,
          }}
        />
      ) : (
        <Pressable onPress={handlePress} style={{ flex: 1 }}>
          <Subtitle
            style={{
              color: value ? theme.colors.gray0 : theme.colors.gray3,
              fontSize: 15,
            }}
          >
            {value || placeholder}
          </Subtitle>
        </Pressable>
      )}
      {onRemove !== undefined && value.length > 0 && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={theme.colors.gray3}
          />
        </Pressable>
      )}
    </View>
  );
}

export function TaskFormScreen({ route, navigation }: TaskFormScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const taskId = route.params?.taskId;
  const isEditing = taskId != null;

  // Load existing task when editing
  const { task, isLoading: taskLoading } = useTaskDetailQuery(taskId ?? "");

  const { users } = useFarmUsersQuery();

  // Local state for labels, links, due date, recurrence
  const [labels, setLabels] = useState<string[]>([]);
  const [labelDialogVisible, setLabelDialogVisible] = useState(false);
  const [labelDialogInput, setLabelDialogInput] = useState("");
  const [links, setLinks] = useState<LinkInput[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceValue | null>(null);
  const [recurrenceModalVisible, setRecurrenceModalVisible] = useState(false);
  const [linkPickerVisible, setLinkPickerVisible] = useState(false);
  // State for opening the picker in edit mode (pre-filtered + pre-selected)
  const [linkPickerInitialEntityType, setLinkPickerInitialEntityType] =
    useState<EntityType | null>(null);
  const [linkPickerInitialAnimalSubView, setLinkPickerInitialAnimalSubView] =
    useState<AnimalSubView>("animals");
  const [linkPickerInitialLinks, setLinkPickerInitialLinks] = useState<
    LinkInput[]
  >([]);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateModalItems, setGenerateModalItems] = useState<LinkInput[]>([]);

  // Track whether we've initialized form from existing task
  const [initialized, setInitialized] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      assigneeId: undefined,
      checklistItems: [],
    },
  });

  const {
    fields: checklistFields,
    append: appendChecklist,
    remove: removeChecklist,
  } = useFieldArray({ control, name: "checklistItems" });
  const [ghostText, setGhostText] = useState("");

  // Initialize form when editing and task is loaded
  React.useEffect(() => {
    if (!isEditing || !task || initialized) return;
    const taskDetail = task as TaskDetail;
    reset({
      name: taskDetail.name,
      description: taskDetail.description ?? "",
      assigneeId: taskDetail.assigneeId ?? undefined,
      dueDate:
        taskDetail.dueDate != null
          ? new Date(taskDetail.dueDate as string)
          : null,
      checklistItems: taskDetail.checklistItems.map((item) => ({
        name: item.name,
        dueDate: item.dueDate != null ? String(item.dueDate) : undefined,
      })),
    });
    setLabels(taskDetail.labels);
    setLinks(
      taskDetail.links.map((l) => ({
        linkType: l.linkType,
        linkedId: l.linkedId,
        displayName: l.displayName ?? l.linkedId,
      })),
    );
    if (taskDetail.recurrence != null) {
      setRecurrence({
        frequency: taskDetail.recurrence.frequency,
        interval: taskDetail.recurrence.interval,
        until:
          taskDetail.recurrence.until != null
            ? String(taskDetail.recurrence.until)
            : null,
      });
    }
    setInitialized(true);
  }, [task, isEditing, initialized]);

  const createMutation = useCreateTaskMutation(() => {
    navigation.navigate("TaskList");
  });

  const updateMutation = useUpdateTaskMutation(taskId ?? "", () => {
    navigation.goBack();
  });

  function onSubmit(values: FormValues) {
    const checklistItems = values.checklistItems
      .filter((item) => item.name.trim().length > 0)
      .map((item) => ({ name: item.name, dueDate: item.dueDate }));

    const linksPayload = links.map((l) => ({
      linkType: l.linkType,
      linkedId: l.linkedId,
    }));
    const recurrencePayload = recurrence
      ? {
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          until: recurrence.until ?? undefined,
        }
      : null;

    if (isEditing) {
      const body: TaskUpdateInput = {
        name: values.name,
        description: values.description || undefined,
        labels,
        assigneeId: values.assigneeId || undefined,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        recurrence: recurrencePayload,
        links: linksPayload,
        checklistItems,
      };
      updateMutation.mutate(body);
    } else {
      const body: TaskCreateInput = {
        name: values.name,
        description: values.description || undefined,
        labels,
        assigneeId: values.assigneeId || undefined,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        recurrence: recurrencePayload ?? undefined,
        links: linksPayload,
        checklistItems,
      };
      createMutation.mutate(body);
    }
  }

  const userOptions = users.map((u) => ({
    label: u.fullName ?? u.email,
    value: u.id,
  }));

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const linkTypeLabels: Record<AllLinkType, string> = {
    animal: t("tasks.link_types.animal"),
    plot: t("tasks.link_types.plot"),
    wiki_entry: t("tasks.link_types.wiki_entry"),
    herd: t("tasks.link_types.herd"),
    contact: t("tasks.link_types.contact"),
    order: t("tasks.link_types.order"),
    treatment: t("tasks.link_types.treatment"),
  };

  const linkTypePluralLabels: Record<AllLinkType, string> = {
    animal: t("tasks.link_types.animal_plural"),
    plot: t("tasks.link_types.plot_plural"),
    wiki_entry: t("tasks.link_types.wiki_entry_plural"),
    herd: t("tasks.link_types.herd_plural"),
    contact: t("tasks.link_types.contact_plural"),
    order: t("tasks.link_types.order_plural"),
    treatment: t("tasks.link_types.treatment_plural"),
  };

  // Group links by linkType for the grouped card display
  const groupedLinks = useMemo(() => {
    const map = new Map<AllLinkType, LinkInput[]>();
    for (const link of links) {
      const existing = map.get(link.linkType) ?? [];
      map.set(link.linkType, [...existing, link]);
    }
    return Array.from(map.entries()).map(([linkType, items]) => ({
      linkType,
      items,
    }));
  }, [links]);

  function openAddLinkPicker() {
    setLinkPickerInitialEntityType(null);
    setLinkPickerInitialLinks([]);
    setLinkPickerVisible(true);
  }

  // Open picker pre-filtered to a specific linkType group for editing
  function openEditLinkGroup(linkType: AllLinkType) {
    const entityType: EntityType =
      linkType === "animal" || linkType === "herd"
        ? "animal"
        : (linkType as EntityType);
    const subView: AnimalSubView = linkType === "herd" ? "herds" : "animals";
    setLinkPickerInitialEntityType(entityType);
    setLinkPickerInitialAnimalSubView(subView);
    setLinkPickerInitialLinks(links.filter((l) => l.linkType === linkType));
    setLinkPickerVisible(true);
  }

  function openGenerateChecklist(items: LinkInput[]) {
    setGenerateModalItems(items);
    setGenerateModalVisible(true);
  }

  function handleGenerateConfirm(selected: LinkInput[]) {
    appendChecklist(selected.map((l) => ({ name: l.displayName })));
    setGenerateModalVisible(false);
  }

  function handleLinksConfirm(confirmedLinks: LinkInput[]) {
    if (linkPickerInitialEntityType != null) {
      // Edit mode: replace all links of the specific linkType being edited
      const replacedLinkType: AllLinkType =
        linkPickerInitialEntityType === "animal"
          ? linkPickerInitialAnimalSubView === "herds"
            ? "herd"
            : "animal"
          : (linkPickerInitialEntityType as AllLinkType);
      setLinks((prev) => [
        ...prev.filter((l) => l.linkType !== replacedLinkType),
        ...confirmedLinks,
      ]);
    } else {
      // Add mode: merge confirmed links, avoiding duplicates by linkedId
      setLinks((prev) => {
        const existingIds = new Set(prev.map((l) => l.linkedId));
        return [
          ...prev,
          ...confirmedLinks.filter((l) => !existingIds.has(l.linkedId)),
        ];
      });
    }
    setLinkPickerVisible(false);
  }

  return (
    <>
      <ContentView
        headerVisible
        footerComponent={
          <BottomActionContainer>
            <Button
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              loading={isSaving}
              disabled={isSaving}
            />
          </BottomActionContainer>
        }
      >
        <ScrollView>
          <H2>{isEditing ? t("tasks.edit_task") : t("tasks.new_task")}</H2>
          <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}>
            {/* Name */}
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

            {/* Description */}
            <RHTextAreaInput
              name="description"
              control={control}
              label={t("forms.labels.description_optional")}
            />

            {/* Assignee */}
            <RHSelect
              name="assigneeId"
              control={control}
              label={t("tasks.assignee")}
              data={userOptions}
              enableSearch
            />

            {/* Due date */}
            <RHDatePicker
              name="dueDate"
              control={control}
              label={t("tasks.due_date")}
              mode="date"
            />

            {/* Recurrence */}
            <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Subtitle style={{ color: theme.colors.gray2, flex: 1 }}>
                  {t("tasks.recurrence")}
                </Subtitle>
                {!recurrence && (
                  <IonIconButton
                    type="accent"
                    icon="add"
                    iconSize={18}
                    color={theme.colors.primary}
                    onPress={() => setRecurrenceModalVisible(true)}
                  />
                )}
              </View>
              {recurrence && (
                <Chip
                  label={recurrenceSummary(recurrence, t)}
                  accent
                  onPress={() => setRecurrenceModalVisible(true)}
                  onRemove={() => setRecurrence(null)}
                />
              )}
            </View>

            {/* Checklist items */}
            <View style={{ marginTop: theme.spacing.m }}>
              <Subtitle
                style={{
                  color: theme.colors.gray2,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {t("tasks.checklist")}
              </Subtitle>
              {checklistFields.map((field, index) => (
                <ChecklistItemRow
                  key={field.id}
                  value={watch(`checklistItems.${index}.name`)}
                  onChangeText={(text) =>
                    setValue(`checklistItems.${index}.name`, text)
                  }
                  onBlur={() => {
                    if (
                      getValues(`checklistItems.${index}.name`).trim() === ""
                    ) {
                      removeChecklist(index);
                    }
                  }}
                  onRemove={() => removeChecklist(index)}
                  placeholder={t("forms.labels.name")}
                />
              ))}
              {/* Ghost row — accumulates text locally; submit appends and stays focused for next item */}
              <ChecklistItemRow
                value={ghostText}
                onChangeText={setGhostText}
                onBlur={() => {
                  if (ghostText.trim().length > 0) {
                    appendChecklist({ name: ghostText.trim() });
                    setGhostText("");
                  }
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  if (ghostText.trim().length > 0) {
                    appendChecklist({ name: ghostText.trim() });
                    setGhostText("");
                  }
                }}
                placeholder={t("tasks.add_checklist_item")}
              />
            </View>

            {/* Labels */}
            <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Subtitle style={{ color: theme.colors.gray2, flex: 1 }}>
                  {t("tasks.labels")}
                </Subtitle>
                <IonIconButton
                  type="accent"
                  icon="add"
                  iconSize={18}
                  color={theme.colors.primary}
                  onPress={() => {
                    setLabelDialogInput("");
                    setLabelDialogVisible(true);
                  }}
                />
              </View>
              {labels.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: theme.spacing.xs,
                  }}
                >
                  {labels.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      onRemove={() =>
                        setLabels((prev) => prev.filter((l) => l !== label))
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Links — grouped by entity type, card per group like CreateTreatmentScreen */}
            <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Subtitle style={{ color: theme.colors.gray2, flex: 1 }}>
                  {t("tasks.links")}
                </Subtitle>
                <IonIconButton
                  type="accent"
                  icon="add"
                  iconSize={18}
                  color={theme.colors.primary}
                  onPress={openAddLinkPicker}
                />
              </View>
              {groupedLinks.map(({ linkType, items }) => (
                <View key={linkType} style={{ gap: theme.spacing.xs }}>
                  <Subtitle style={{ color: theme.colors.gray2 }}>
                    {linkTypeLabels[linkType]}
                  </Subtitle>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <ListItem
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.white,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.primary,
                      }}
                      onPress={() => openEditLinkGroup(linkType)}
                    >
                      <ListItem.Content>
                        <ListItem.Title style={{ color: theme.colors.primary }}>
                          {items.length === 1
                            ? items[0].displayName
                            : `${items.length} ${linkTypePluralLabels[linkType]}`}
                        </ListItem.Title>
                      </ListItem.Content>
                      <ListItem.Chevron />
                    </ListItem>
                    <IonIconButton
                      type="accent"
                      icon="checkbox-outline"
                      color={theme.colors.primary}
                      onPress={() => openGenerateChecklist(items)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ContentView>

      {/* Label input dialog */}
      <Modal
        visible={labelDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLabelDialogVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setLabelDialogVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: theme.radii.m,
              padding: theme.spacing.l,
              width: "80%",
              gap: theme.spacing.m,
            }}
            onPress={() => {
              /* prevent backdrop close */
            }}
          >
            <Subtitle style={{ fontSize: 16, fontWeight: "600" }}>
              {t("tasks.add_label")}
            </Subtitle>
            <RNTextInput
              value={labelDialogInput}
              onChangeText={setLabelDialogInput}
              placeholder={t("tasks.labels")}
              placeholderTextColor={theme.colors.gray2}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (labelDialogInput.trim()) {
                  setLabels((prev) => [...prev, labelDialogInput.trim()]);
                }
                setLabelDialogVisible(false);
              }}
              style={{
                backgroundColor: theme.colors.gray5,
                borderRadius: theme.radii.s,
                padding: theme.spacing.s,
                color: theme.colors.text,
                fontSize: 16,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: theme.spacing.s,
              }}
            >
              <Pressable
                onPress={() => setLabelDialogVisible(false)}
                style={{ padding: theme.spacing.s }}
              >
                <Subtitle style={{ color: theme.colors.gray1 }}>
                  {t("buttons.cancel")}
                </Subtitle>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (labelDialogInput.trim()) {
                    setLabels((prev) => [...prev, labelDialogInput.trim()]);
                  }
                  setLabelDialogVisible(false);
                }}
                style={{ padding: theme.spacing.s }}
              >
                <Subtitle
                  style={{ color: theme.colors.primary, fontWeight: "600" }}
                >
                  {t("buttons.ok")}
                </Subtitle>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <GenerateChecklistModal
        visible={generateModalVisible}
        items={generateModalItems}
        onClose={() => setGenerateModalVisible(false)}
        onConfirm={handleGenerateConfirm}
      />

      <LinkPickerModal
        visible={linkPickerVisible}
        onClose={() => setLinkPickerVisible(false)}
        onConfirm={handleLinksConfirm}
        initialEntityType={linkPickerInitialEntityType}
        initialAnimalSubView={linkPickerInitialAnimalSubView}
        initialSelectedLinks={linkPickerInitialLinks}
      />

      <RecurrencePickerModal
        visible={recurrenceModalVisible}
        value={recurrence}
        onConfirm={setRecurrence}
        onClose={() => setRecurrenceModalVisible(false)}
      />
    </>
  );
}

function recurrenceSummary(
  value: RecurrenceValue,
  t: (key: string) => string,
): string {
  const n = value.interval;
  const unitSingular: Record<RecurrenceValue["frequency"], string> = {
    weekly: t("animals.week"),
    monthly: t("animals.month"),
    yearly: t("animals.year"),
  };
  const unitPlural: Record<RecurrenceValue["frequency"], string> = {
    weekly: t("animals.weeks"),
    monthly: t("animals.months"),
    yearly: t("animals.years"),
  };
  const unit =
    n === 1 ? unitSingular[value.frequency] : unitPlural[value.frequency];
  return `${t("animals.every")} ${n} ${unit}`;
}
