import { Subtitle } from "@/theme/Typography";
import { View, ViewProps } from "react-native";
import styled, { useTheme } from "styled-components/native";

type CardProps = ViewProps & {
  elevated?: boolean;
};

export function Card({ style, elevated, ...props }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.white,
          // backgroundColor: "#91866b",
          borderRadius: theme.radii.l,

          ...(elevated && {
            elevation: 8,
            shadowColor: theme.colors.gray1,
            shadowOffset: { width: 3, height: 3 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
          }),

          padding: theme.spacing.m,
          // marginHorizontal: 5,
        },
        style,
      ]}
      {...props}
    />
  );
}
//  React.FC & {
//   Title: typeof CardTitle;
//   Content: typeof CardContent;
// }

export const CardTitle = Subtitle;
Card.Title = CardTitle;

export const CardContent = styled.View`
  margin-top: ${({ theme }) => theme.spacing.m}px;
`;

Card.Content = CardContent;
