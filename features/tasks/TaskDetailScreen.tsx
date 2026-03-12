import { TaskDetail } from "@/api/tasks.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Chip } from "@/components/chips/Chip";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView as RNScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import {
  useDeleteTaskMutation,
  useSetTaskStatusMutation,
  useTaskDetailQuery,
  useToggleChecklistItemMutation,
} from "./tasks.hooks";
import { TaskDetailScreenProps } from "./navigation/tasks-routes";

type LinkDetailModalProps = {
  visible: boolean;
  items: TaskDetail["links"];
  linkTypeLabel: string;
  onClose: () => void;
  onNavigate: (link: TaskDetail["links"][number]) => void;
};

function LinkDetailModal({ visible, items, linkTypeLabel, onClose, onNavigate }: LinkDetailModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) return;
    setSearch("");
  }, [visible]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => (i.displayName ?? i.linkedId).toLowerCase().includes(q));
  }, [items, search]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.background }}>
          <View style={{ height: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, justifyContent: "flex-end" }}>
            <Pressable onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <Ionicons name="close" size={28} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.s }}>
          <H2>{linkTypeLabel}</H2>
          <View style={{ marginTop: theme.spacing.m }}>
            <TextInput
              hideLabel
              placeholder={t("forms.placeholders.search")}
              onChangeText={setSearch}
              value={search}
            />
          </View>
          <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ borderTopRightRadius: 10, borderTopLeftRadius: 10, overflow: "hidden", backgroundColor: filtered.length > 0 ? theme.colors.white : undefined }}
              renderItem={({ item }) => (
                <ListItem style={{ paddingVertical: 5 }} onPress={() => onNavigate(item)}>
                  <ListItem.Content>
                    <ListItem.Title>{item.displayName ?? item.linkedId}</ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              )}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function recurrenceSummary(value: { frequency: string; interval: number }, t: (key: string) => string): string {
  const n = value.interval;
  const unitSingular: Record<string, string> = {
    weekly: t("animals.week"),
    monthly: t("animals.month"),
    yearly: t("animals.year"),
  };
  const unitPlural: Record<string, string> = {
    weekly: t("animals.weeks"),
    monthly: t("animals.months"),
    yearly: t("animals.years"),
  };
  const unit = n === 1 ? (unitSingular[value.frequency] ?? value.frequency) : (unitPlural[value.frequency] ?? value.frequency);
  return `${t("animals.every")} ${n} ${unit}`;
}

export function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { t } = useTranslation();

  type LinkType = TaskDetail["links"][number]["linkType"];

  const linkTypeLabels: Record<LinkType, string> = {
    animal: t("tasks.link_types.animal"),
    plot: t("tasks.link_types.plot"),
    wiki_entry: t("tasks.link_types.wiki_entry"),
    herd: t("tasks.link_types.herd"),
    contact: t("tasks.link_types.contact"),
    order: t("tasks.link_types.order"),
    treatment: t("tasks.link_types.treatment"),
  };

  const linkTypePluralLabels: Record<LinkType, string> = {
    animal: t("tasks.link_types.animal_plural"),
    plot: t("tasks.link_types.plot_plural"),
    wiki_entry: t("tasks.link_types.wiki_entry_plural"),
    herd: t("tasks.link_types.herd_plural"),
    contact: t("tasks.link_types.contact_plural"),
    order: t("tasks.link_types.order_plural"),
    treatment: t("tasks.link_types.treatment_plural"),
  };
  const theme = useTheme();
  const { taskId } = route.params;

  const { task, isLoading } = useTaskDetailQuery(taskId);
  const setStatusMutation = useSetTaskStatusMutation(taskId);
  const toggleChecklistMutation = useToggleChecklistItemMutation(taskId);
  const deleteMutation = useDeleteTaskMutation(() => navigation.goBack());

  const [linkDetailVisible, setLinkDetailVisible] = useState(false);
  const [linkDetailItems, setLinkDetailItems] = useState<TaskDetail["links"]>([]);
  const [linkDetailType, setLinkDetailType] = useState<LinkType>("animal");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <Ionicons name="create-outline" size={35} color={theme.colors.primary} onPress={() => navigation.navigate("TaskForm", { taskId })} />
          <Ionicons name="trash-outline" size={35} color={theme.colors.danger} onPress={onDeletePress} />
        </View>
      ),
    });
  }, [navigation, task]);

  function onDeletePress() {
    Alert.alert(t("tasks.delete_confirm"), t("tasks.delete_confirm_message"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate(taskId),
      },
    ]);
  }

  function onToggleStatus() {
    if (!task) return;
    const nextStatus = task.status === "todo" ? "done" : "todo";
    setStatusMutation.mutate(nextStatus, {
      onSuccess: () => { if (nextStatus === "done") navigation.goBack(); },
    });
  }

  const groupedLinks = useMemo(() => {
    if (!task) return [];
    const map = new Map<LinkType, TaskDetail["links"]>();
    for (const link of task.links) {
      map.set(link.linkType, [...(map.get(link.linkType) ?? []), link]);
    }
    return Array.from(map.entries()).map(([linkType, items]) => ({ linkType, items }));
  }, [task?.links]);

  function openLinkGroup(linkType: LinkType, items: TaskDetail["links"]) {
    setLinkDetailType(linkType);
    setLinkDetailItems(items);
    setLinkDetailVisible(true);
  }

  function navigateToLink(link: TaskDetail["links"][number]) {
    setLinkDetailVisible(false);
    switch (link.linkType) {
      case "animal":
        navigation.navigate("AnimalDetails", { animalId: link.linkedId });
        break;
      case "plot":
        navigation.navigate("PlotsMap", { selectedPlotId: link.linkedId });
        break;
      case "wiki_entry":
        navigation.navigate("WikiDetail", { entryId: link.linkedId });
        break;
      case "herd":
        navigation.navigate("HerdEdit", { herdId: link.linkedId });
        break;
    }
  }

  if (isLoading) {
    return (
      <ContentView headerVisible>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </ContentView>
    );
  }

  if (!task) {
    return (
      <ContentView headerVisible>
        <Subtitle>{t("common.no_entries")}</Subtitle>
      </ContentView>
    );
  }

  return (
    <>
    <ContentView headerVisible footerComponent={
      <BottomActionContainer>
        <Button
          title={task.status === "done" ? t("tasks.reopen") : t("tasks.mark_done")}
          onPress={onToggleStatus}
          loading={setStatusMutation.isPending}
        />
      </BottomActionContainer>
    }>
      <ScrollView>
        <H2>{task.name}</H2>

        {/* Status + due date + assignee + labels as chips */}
        {(task.status === "done" || task.dueDate != null || task.assignee != null || task.labels.length > 0) && (
          <RNScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: theme.spacing.s }}
            contentContainerStyle={{ gap: theme.spacing.xs, paddingVertical: theme.spacing.xs }}
          >
            {task.status === "done" && (
              <Chip
                label={t("tasks.status_done")}
                bgColor={theme.colors.success}
                textColor={theme.colors.white}
              />
            )}
            {task.dueDate != null && (
              <Chip
                label={new Date(task.dueDate as string).toLocaleDateString()}
                bgColor={theme.colors.danger}
                textColor={theme.colors.white}
              />
            )}
            {task.assignee != null && (
              <Chip
                label={task.assignee.fullName ?? task.assignee.email}
                bgColor={theme.colors.blue}
                textColor={theme.colors.white}
              />
            )}
            {task.labels.map((label) => (
              <Chip key={label} label={label} />
            ))}
          </RNScrollView>
        )}

        {/* Description */}
        {task.description != null && (
          <View style={{ marginTop: theme.spacing.l }}>
            <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xxs }}>
              {t("forms.labels.description")}
            </Subtitle>
            <Subtitle>{task.description}</Subtitle>
          </View>
        )}

        {/* Recurrence */}
        {task.recurrence != null && (
          <Row label={t("tasks.recurrence")}>
            <Subtitle>{recurrenceSummary(task.recurrence, t)}</Subtitle>
          </Row>
        )}

        {/* Checklist */}
        {task.checklistItems.length > 0 && (
          <View style={{ marginTop: theme.spacing.m }}>
            <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xs }}>
              {t("tasks.checklist")}
            </Subtitle>
            {task.checklistItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  toggleChecklistMutation.mutate({ itemId: item.id, done: !item.done })
                }
                style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.s, paddingVertical: theme.spacing.xs }}
              >
                <Ionicons
                  name={item.done ? "checkbox" : "square-outline"}
                  size={22}
                  color={item.done ? theme.colors.primary : theme.colors.gray3}
                />
                <View>
                  <Subtitle style={item.done ? { textDecorationLine: "line-through", color: theme.colors.gray3 } : undefined}>
                    {item.name}
                  </Subtitle>
                  {item.dueDate != null && (
                    <Subtitle style={{ fontSize: 11, color: theme.colors.gray2 }}>
                      {new Date(item.dueDate as string).toLocaleDateString()}
                    </Subtitle>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Links */}
        {groupedLinks.length > 0 && (
          <View style={{ gap: theme.spacing.s, marginTop: theme.spacing.m }}>
            <Subtitle style={{ color: theme.colors.gray2 }}>{t("tasks.links")}</Subtitle>
            {groupedLinks.map(({ linkType, items }) => (
              <View key={linkType} style={{ gap: theme.spacing.xs }}>
                <Subtitle style={{ color: theme.colors.gray2 }}>{linkTypeLabels[linkType]}</Subtitle>
                <ListItem
                  style={{
                    backgroundColor: theme.colors.white,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.primary,
                  }}
                  onPress={() => openLinkGroup(linkType, items)}
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ color: theme.colors.primary }}>
                      {items.length === 1 ? items[0].displayName ?? items[0].linkedId : `${items.length} ${linkTypePluralLabels[linkType]}`}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ContentView>

    <LinkDetailModal
      visible={linkDetailVisible}
      items={linkDetailItems}
      linkTypeLabel={linkTypePluralLabels[linkDetailType]}
      onClose={() => setLinkDetailVisible(false)}
      onNavigate={navigateToLink}
    />
    </>
  );
}

type RowProps = { label: string; children: React.ReactNode };
function Row({ label, children }: RowProps) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.m }}>
      <Subtitle style={{ color: theme.colors.gray2, marginBottom: theme.spacing.xxs }}>{label}</Subtitle>
      {children}
    </View>
  );
}

