import { ListItem } from "@/components/list/ListItem";
import { H3 } from "@/theme/Typography";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "styled-components/native";

export function List({
  style,
  title,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  title?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          // marginTop: theme.spacing.xl,
          // shadowColor: theme.colors.gray2,
          // shadowOffset: { width: 0, height: 5 },
          // shadowOpacity: 0.2,
          // shadowRadius: 5,
          marginHorizontal: 5,
        },
        style,
      ]}
    >
      {title ? <H3>{title}</H3> : null}
      <View
        style={{
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
          marginTop: title ? theme.spacing.m : 0,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Item({
  title,
  hideBottomDivider = false,
  onPress,
  disabled,
}: {
  title: string;
  hideBottomDivider?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <ListItem
      onPress={onPress}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
      hideBottomDivider={hideBottomDivider}
    >
      <ListItem.Content>
        <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
          {title}
        </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
}

List.Item = Item;
