import React from "react";
import { usePlotsMapContext } from "./plots-map-mode";
import { ViewModeLayers } from "./layers/ViewModeLayers";
import {
  SplitModeLayers,
  SplitModeLayersHandle,
} from "./layers/SplitModeLayers";
import { MergeModeLayers } from "./layers/MergeModeLayers";
import {
  AdjustModeLayers,
  AdjustModeLayersHandle,
} from "./layers/AdjustModeLayers";
import {
  CreateModeLayers,
  CreateModeLayersHandle,
} from "./layers/CreateModeLayers";
type MapLayersProps = {
  splitLayersRef: React.RefObject<SplitModeLayersHandle | null>;
  adjustLayersRef: React.RefObject<AdjustModeLayersHandle | null>;
  createLayersRef: React.RefObject<CreateModeLayersHandle | null>;
};

// Each mode is wrapped in a React.Fragment with a unique key based on mode type.
// This forces react-native-maps to fully unmount/remount children when the mode
// changes, which prevents stale polygon artifacts from lingering on the map.
export function MapLayers({
  splitLayersRef,
  adjustLayersRef,
  createLayersRef,
}: MapLayersProps) {
  const { mode } = usePlotsMapContext();

  switch (mode.type) {
    case "view":
      return (
        <React.Fragment key="view">
          <ViewModeLayers />
        </React.Fragment>
      );
    case "split":
      return (
        <React.Fragment key={`split-${mode.plotId}`}>
          <SplitModeLayers ref={splitLayersRef} />
        </React.Fragment>
      );
    case "merge":
      return (
        <React.Fragment key={`merge-${mode.primaryPlotId}`}>
          <MergeModeLayers />
        </React.Fragment>
      );
    case "adjust":
      return (
        <React.Fragment key={`adjust-${mode.plotId}`}>
          <AdjustModeLayers ref={adjustLayersRef} />
        </React.Fragment>
      );
    case "create":
      return (
        <React.Fragment key="create">
          <CreateModeLayers ref={createLayersRef} />
        </React.Fragment>
      );
  }
}
