import { Stack } from "@/navigation/stack";
import { WikiListScreen } from "../WikiListScreen";
import { WikiDetailScreen } from "../WikiDetailScreen";
import { WikiEntryFormScreen } from "../WikiEntryFormScreen";
import { WikiChangeRequestScreen } from "../WikiChangeRequestScreen";
import { WikiChangeRequestDraftScreen } from "../WikiChangeRequestDraftScreen";

export function renderWikiStack() {
  return [
    <Stack.Screen
      key="wiki-list"
      name="WikiList"
      options={{ title: "" }}
      component={WikiListScreen}
    />,
    <Stack.Screen
      key="wiki-detail"
      name="WikiDetail"
      options={{ title: "" }}
      component={WikiDetailScreen}
    />,
    <Stack.Screen
      key="wiki-entry-form"
      name="WikiEntryForm"
      options={{ title: "" }}
      component={WikiEntryFormScreen}
    />,
    <Stack.Screen
      key="wiki-change-request"
      name="WikiChangeRequest"
      options={{ title: "" }}
      component={WikiChangeRequestScreen}
    />,
    <Stack.Screen
      key="wiki-change-request-draft"
      name="WikiChangeRequestDraft"
      options={{ title: "" }}
      component={WikiChangeRequestDraftScreen}
    />,
  ];
}
