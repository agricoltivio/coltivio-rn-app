import React from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "@/components/text/Text";
import styled from "styled-components/native";

interface SquareCtaProps {
  onPress: () => void;
  text: string;
  disabled?: boolean;
}

export const SquareCta = ({ onPress, text, disabled }: SquareCtaProps) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Container>
        <Text>{text}</Text>
      </Container>
    </TouchableOpacity>
  );
};

// TODO: Remove magic numbers for a constant from theme:
const Container = styled.View({
  padding: 8,
  height: 40,
  backgroundColor: "white",
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
});
