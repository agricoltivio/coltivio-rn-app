import { Ionicons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import { PressableProps, View } from "react-native";
import styled, { useTheme } from "styled-components/native";

const PressableListItem = styled.Pressable<{ hideBottomDivider?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.m}px 0px`};
  border-bottom-width: ${({ hideBottomDivider }) =>
    hideBottomDivider ? 0 : "2px"};
  border-color: ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.white};
  flex-direction: row;
  /* gap: 10px; */
`;

export function ListItem(
  props: PressableProps & { hideBottomDivider?: boolean }
) {
  return <PressableListItem {...props} />;
}

const ListItemTitle = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray1};
`;

const ListItemBody = styled.Text`
  font-size: 17px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray2};
`;

export const ListItemContent = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.m}px;
`;

function ListItemChevron() {
  const theme = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 40,
      }}
    >
      <Ionicons name="chevron-forward" size={24} color={theme.colors.gray3} />
    </View>
  );
}

function ListItemCheckbox({ checked }: { checked: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 40,
      }}
    >
      <Ionicons
        name={checked ? "checkbox-outline" : "square-outline"}
        size={24}
        color={theme.colors.black}
      />
    </View>
  );
}

function ListItemRightIcon({ children }: PropsWithChildren) {
  const theme = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        marginRight: theme.spacing.m,
      }}
    >
      {children}
    </View>
  );
}

ListItem.Body = ListItemBody;
ListItem.Title = ListItemTitle;
ListItem.Content = ListItemContent;
ListItem.Chevron = ListItemChevron;
ListItem.Checkbox = ListItemCheckbox;
ListItem.RightIcon = ListItemRightIcon;
