import { FontWeight } from "@shopify/react-native-skia";
import React, { ReactNode } from "react";
import { Text, TextStyle, StyleSheet, TextProps } from "react-native";
import styled from "styled-components/native";

interface TypographyProps extends TextProps {
  children: ReactNode;
  style?: TextStyle;
}

export const H1 = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
`;

export const H2 = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
`;

export const H3 = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

export const H4 = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

export const Title = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray0};
`;

export const Subtitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray1};
`;

export const Label = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray1};
`;

export const Body = styled.Text`
  font-size: 17px;
  font-weight: 400;
  color: ${(props) => props.theme.colors.primary};
`;

// Headline
export const Headline: React.FC<TypographyProps> = ({
  children,
  style,
  ...props
}) => (
  <Text style={[styles.headline, style]} {...props}>
    {children}
  </Text>
);

// Subheadline
export const Subheadline: React.FC<TypographyProps> = ({
  children,
  style,
  ...props
}) => (
  <Text style={[styles.subheadline, style]} {...props}>
    {children}
  </Text>
);

// Callout
export const Callout: React.FC<TypographyProps> = ({
  children,
  style,
  ...props
}) => (
  <Text style={[styles.callout, style]} {...props}>
    {children}
  </Text>
);

// Footnote
export const Footnote: React.FC<TypographyProps> = ({
  children,
  style,
  ...props
}) => (
  <Text style={[styles.footnote, style]} {...props}>
    {children}
  </Text>
);

// Caption1
export const Caption1: React.FC<TypographyProps> = ({
  children,
  style,
  ...props
}) => (
  <Text style={[styles.caption1, style]} {...props}>
    {children}
  </Text>
);

// Caption2
export const Caption2: React.FC<TypographyProps> = ({
  children,
  style,
  ...props
}) => (
  <Text style={[styles.caption2, style]} {...props}>
    {children}
  </Text>
);

// let's see if this is enough, might need a <Bold/> and <SemiBold/> wrapper at some point:
const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: "bold",
  },
  title1: {
    fontSize: 28,
    fontWeight: "bold",
  },
  title2: {
    fontSize: 22,
    fontWeight: "600",
  },
  headline: {
    fontSize: 17,
    fontWeight: "600",
  },
  subheadline: {
    fontSize: 15,
    fontWeight: "400",
    color: "#6b6b6b",
  },
  callout: {
    fontSize: 16,
    color: "#333",
  },
  body: {
    fontSize: 17,
    fontWeight: "400",
  },
  footnote: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6b6b6b",
  },
  caption1: {
    fontSize: 12,
    fontWeight: "400",
    color: "#8e8e8e",
  },
  caption2: {
    fontSize: 11,
    fontWeight: "400",
    color: "#8e8e8e",
  },
});
