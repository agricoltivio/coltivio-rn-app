import React from "react";
import { usePlotsMapContext } from "./plots-map-mode";
import { ViewModeControls } from "./controls/ViewModeControls";
import { SplitModeControls } from "./controls/SplitModeControls";
import { MergeModeControls } from "./controls/MergeModeControls";
import { AdjustModeControls } from "./controls/AdjustModeControls";
import { CreateModeControls } from "./controls/CreateModeControls";
import { SplitModeLayersHandle } from "./layers/SplitModeLayers";
import { AdjustModeLayersHandle } from "./layers/AdjustModeLayers";

type MapOverlaysProps = {
  splitLayersRef: React.RefObject<SplitModeLayersHandle | null>;
  adjustLayersRef: React.RefObject<AdjustModeLayersHandle | null>;
  onDelete: () => void;
};

export function MapOverlays({
  splitLayersRef,
  adjustLayersRef,
  onDelete,
}: MapOverlaysProps) {
  const { mode } = usePlotsMapContext();

  switch (mode.type) {
    case "view":
      return <ViewModeControls onDelete={onDelete} />;
    case "split":
      return <SplitModeControls splitLayersRef={splitLayersRef} />;
    case "merge":
      return <MergeModeControls />;
    case "adjust":
      return <AdjustModeControls adjustLayersRef={adjustLayersRef} />;
    case "create":
      return <CreateModeControls />;
  }
}
