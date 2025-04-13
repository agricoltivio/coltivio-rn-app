import React from "react";
import styled, { useTheme } from "styled-components/native";

const OUTER_BUTTON_SIZE = 24;
const INNER_BUTTON_SIZE = 16;
const BUTTON_BORDER_WIDTH = 2; // should be in theme, I guess.

interface RadioButtonProps {
  selected: boolean;
}

export const RadioButton = ({ selected }: RadioButtonProps) => {
  const theme = useTheme();

  return (
    <OuterCircle borderRadius={theme.radii.xxl}>
      {selected ? <InnerCircle borderRadius={theme.radii.xxl} /> : null}
    </OuterCircle>
  );
};

const OuterCircle = styled.View<{ borderRadius: number }>(
  ({ borderRadius }) => ({
    height: OUTER_BUTTON_SIZE,
    width: OUTER_BUTTON_SIZE,
    borderRadius: borderRadius,
    borderWidth: BUTTON_BORDER_WIDTH,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  })
);

const InnerCircle = styled.View<{ borderRadius: number }>(
  ({ borderRadius }) => ({
    height: INNER_BUTTON_SIZE,
    width: INNER_BUTTON_SIZE,
    borderRadius: borderRadius,
    backgroundColor: "black",
  })
);
