import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { type PlotColorMode } from "@/components/map/PlotsLayer";
import { InsetsProps } from "@/constants/Screen";
import { usePlotsMapContext } from "@/features/plots/map/plots-map-mode";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type ModeOption = {
  mode: PlotColorMode;
  labelKey: string;
};

const MODE_OPTIONS: ModeOption[] = [
  { mode: "plot", labelKey: "plots.color_mode.plot" },
  { mode: "crop", labelKey: "plots.color_mode.crop" },
  { mode: "usage", labelKey: "plots.color_mode.usage" },
  { mode: "cutting", labelKey: "plots.color_mode.cutting" },
];

type MapPlotColorToggleProps = {
  /** When provided, renders top-left at this top value; panel opens to the right. */
  topOffset?: number;
};

export function MapPlotColorToggle({ topOffset }: MapPlotColorToggleProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { mode, plotColorMode, setPlotColorMode } = usePlotsMapContext();
  const [expanded, setExpanded] = useState(false);

  if (mode.type !== "view") return null;

  return (
    // Container is sized to the button only; panel is absolutely positioned without affecting layout
    <ButtonContainer insets={insets} topOffset={topOffset}>
      {expanded && (
        <OptionsPanel topLeft={topOffset !== undefined}>
          {MODE_OPTIONS.map((option) => {
            const isActive = option.mode === plotColorMode;
            return (
              <TouchableOpacity
                key={option.mode}
                onPress={() => {
                  setPlotColorMode(option.mode);
                  setExpanded(false);
                }}
              >
                <OptionRow>
                  <OptionLabel active={isActive}>{t(option.labelKey)}</OptionLabel>
                </OptionRow>
              </TouchableOpacity>
            );
          })}
        </OptionsPanel>
      )}
      <MaterialCommunityIconButton
        type="accent"
        color={theme.colors.black}
        iconSize={30}
        icon="palette-outline"
        onPress={() => setExpanded((prev) => !prev)}
      />
    </ButtonContainer>
  );
}

type ButtonContainerProps = InsetsProps & { topOffset?: number };

const ButtonContainer = styled.View<ButtonContainerProps>`
  position: absolute;
  ${({ topOffset, theme, insets }) =>
    topOffset !== undefined
      ? `left: ${theme.spacing.m}px; top: ${topOffset}px;`
      : `right: ${theme.spacing.xxl}px; bottom: ${insets.bottom + 64}px;`}
  align-items: flex-end;
`;

// Opens above when bottom-right, to the right when top-left
const OptionsPanel = styled.View<{ topLeft: boolean }>`
  position: absolute;
  ${({ topLeft }) =>
    topLeft
      ? `left: 52px; top: 0;`
      : `bottom: 52px; right: 0;`}
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.m}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 4px;
  min-width: 120px;
`;

const OptionRow = styled.View`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.s}px;
`;

const OptionLabel = styled.Text<{ active: boolean }>`
  font-size: 14px;
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.black)};
  font-weight: ${({ active }) => (active ? "600" : "400")};
`;
