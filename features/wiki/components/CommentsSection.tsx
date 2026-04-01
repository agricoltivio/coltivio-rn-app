import { TextInput } from "@/components/inputs/TextInput";
import { useSession } from "@/auth/SessionProvider";
import { H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import styled, { useTheme } from "styled-components/native";
import {
  useAddChangeRequestNoteMutation,
  useChangeRequestNotesQuery,
} from "../wiki.hooks";

export function CommentsSection({
  changeRequestId,
  readOnly = false,
}: {
  changeRequestId: string;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { authUser } = useSession();
  const { notes } = useChangeRequestNotesQuery(changeRequestId);
  const addNoteMutation = useAddChangeRequestNoteMutation(changeRequestId);
  const [commentText, setCommentText] = useState("");

  function onSend() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    addNoteMutation.mutate(trimmed, {
      onSuccess: () => setCommentText(""),
    });
  }

  return (
    <View
      style={{
        marginTop: theme.spacing.xl,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray4,
        paddingTop: theme.spacing.m,
      }}
    >
      <H3 style={{ marginBottom: theme.spacing.s }}>{t("wiki.comments")}</H3>

      {notes.length === 0 && (
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.gray2,
            marginBottom: theme.spacing.m,
          }}
        >
          {t("wiki.no_comments")}
        </Text>
      )}

      {notes.map((note) => {
        const isOwn = note.authorId === authUser?.id;
        const time =
          typeof note.createdAt === "string"
            ? new Date(note.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
        return (
          <View
            key={note.id}
            style={{
              alignSelf: isOwn ? "flex-end" : "flex-start",
              maxWidth: "80%",
              marginBottom: theme.spacing.s,
            }}
          >
            {!isOwn && (
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: theme.colors.gray2,
                  marginBottom: 2,
                }}
              >
                {t("wiki.moderator")}
              </Text>
            )}
            <View
              style={{
                backgroundColor: isOwn
                  ? theme.colors.primary
                  : theme.colors.gray4,
                borderRadius: theme.radii.m,
                borderBottomRightRadius: isOwn ? 4 : theme.radii.m,
                borderBottomLeftRadius: isOwn ? theme.radii.m : 4,
                padding: theme.spacing.s,
              }}
            >
              <NoteText isOwn={isOwn}>{note.body}</NoteText>
            </View>
            {time ? (
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.gray2,
                  marginTop: 2,
                  alignSelf: isOwn ? "flex-end" : "flex-start",
                }}
              >
                {time}
              </Text>
            ) : null}
          </View>
        );
      })}

      {!readOnly && (
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.s,
            alignItems: "flex-end",
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.xl,
          }}
        >
          <View style={{ flex: 1 }}>
            <TextInput
              hideLabel
              placeholder={t("wiki.add_comment")}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            onPress={onSend}
            disabled={addNoteMutation.isPending}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radii.xxl,
              padding: theme.spacing.s,
              opacity: addNoteMutation.isPending ? 0.4 : 1,
            }}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const NoteText = styled.Text<{ isOwn: boolean }>`
  font-size: 14px;
  color: ${({ theme, isOwn }) =>
    isOwn ? theme.colors.white : theme.colors.primary};
  line-height: 20px;
`;
