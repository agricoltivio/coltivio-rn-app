import { Meadow } from "@/api/meadows.api";
import { Plot } from "@/api/plots.api";
import { type DrawingOverlayRef } from "@/components/map/DrawingOverlay";
import { type BaseLayer } from "@/components/map/MapLibreMap";
import { type PlotColorMode } from "@/components/map/PlotsLayer";
import { type MapRef, type CameraRef } from "@maplibre/maplibre-react-native";
import { NavigationProp } from "@react-navigation/native";
import { createContext, useContext, Dispatch } from "react";

// "parcel": pick a cadastral parcel (plots), "plots": tap existing plots to merge (meadows)
export type DrawAction =
  | "select"
  | "edit"
  | "draw"
  | "choose"
  | "parcel"
  | "plots";

// What the create mode produces
export type CreateTarget = "plot" | "meadow";

// --- Mode types ---

type ViewMode = { type: "view"; selectedPlotId: string | null };
type SplitMode = {
  type: "split";
  plotId: string;
  activeToolMode: "polyline" | "polygon" | "polygon-edit" | "extract" | "none";
  currentPolygons: GeoJSON.MultiPolygon[];
};
type MergeMode = {
  type: "merge";
  primaryPlotId: string;
  selectedPlotIds: string[];
};
type AdjustMode = { type: "adjust"; plotId: string; activeRingIndex: number };
type CreateMode = {
  type: "create";
  target: CreateTarget;
  drawingAction: DrawAction;
  // Plots tapped while creating a meadow from existing plots
  selectedPlotIds: string[];
  newPolygon: {
    geometry: GeoJSON.MultiPolygon;
    centroid: GeoJSON.Point;
    size: number;
    usage?: number;
    localId?: string;
    cuttingDate?: string;
  } | null;
};

// Multi-part meadows are edited one part at a time; finished parts are kept in editedParts
type MeadowAdjustMode = {
  type: "meadowAdjust";
  meadowId: string;
  activePartIndex: number;
  editedParts: GeoJSON.Position[][][];
};

export type PlotsMapMode =
  | MeadowAdjustMode
  | ViewMode
  | SplitMode
  | MergeMode
  | AdjustMode
  | CreateMode;

// --- Actions ---

export type PlotsMapAction =
  | { type: "SELECT_PLOT"; plotId: string | null }
  | {
      type: "ENTER_SPLIT";
      plotId: string;
      initialGeometry: GeoJSON.MultiPolygon;
    }
  | {
      type: "SET_SPLIT_TOOL";
      tool: "polyline" | "polygon" | "polygon-edit" | "extract" | "none";
    }
  | { type: "SET_SPLIT_POLYGONS"; polygons: GeoJSON.MultiPolygon[] }
  | { type: "ENTER_MERGE"; primaryPlotId: string }
  | { type: "TOGGLE_MERGE_PLOT"; plotId: string }
  | { type: "ENTER_ADJUST"; plotId: string }
  | { type: "ADVANCE_ADJUST_RING" }
  | { type: "ENTER_CREATE"; target?: CreateTarget }
  | { type: "SET_CREATE_TARGET"; target: CreateTarget }
  | { type: "SET_CREATE_ACTION"; action: DrawAction }
  | { type: "TOGGLE_CREATE_PLOT"; plotId: string }
  | { type: "ENTER_MEADOW_ADJUST"; meadowId: string }
  | { type: "ADVANCE_MEADOW_PART"; editedPart: GeoJSON.Position[][] }
  | {
      type: "SET_CREATE_POLYGON";
      polygon: CreateMode["newPolygon"];
    }
  | { type: "EXIT_MODE" };

// --- Reducer ---

export function plotsMapReducer(
  state: PlotsMapMode,
  action: PlotsMapAction,
): PlotsMapMode {
  switch (action.type) {
    case "SELECT_PLOT":
      if (state.type === "view") {
        return { ...state, selectedPlotId: action.plotId };
      }
      return state;

    case "ENTER_SPLIT":
      return {
        type: "split",
        plotId: action.plotId,
        activeToolMode: "none",
        currentPolygons: [action.initialGeometry],
      };

    case "SET_SPLIT_TOOL":
      if (state.type === "split") {
        return { ...state, activeToolMode: action.tool };
      }
      return state;

    case "SET_SPLIT_POLYGONS":
      if (state.type === "split") {
        return { ...state, currentPolygons: action.polygons };
      }
      return state;

    case "ENTER_MERGE":
      return {
        type: "merge",
        primaryPlotId: action.primaryPlotId,
        selectedPlotIds: [action.primaryPlotId],
      };

    case "TOGGLE_MERGE_PLOT":
      if (state.type === "merge") {
        // Cannot deselect primary plot
        if (action.plotId === state.primaryPlotId) return state;
        const isSelected = state.selectedPlotIds.includes(action.plotId);
        return {
          ...state,
          selectedPlotIds: isSelected
            ? state.selectedPlotIds.filter((id) => id !== action.plotId)
            : [...state.selectedPlotIds, action.plotId],
        };
      }
      return state;

    case "ENTER_ADJUST":
      return { type: "adjust", plotId: action.plotId, activeRingIndex: 0 };

    case "ADVANCE_ADJUST_RING":
      if (state.type === "adjust") {
        return { ...state, activeRingIndex: state.activeRingIndex + 1 };
      }
      return state;

    case "ENTER_CREATE":
      return {
        type: "create",
        target: action.target ?? "plot",
        drawingAction: "choose",
        selectedPlotIds: [],
        newPolygon: null,
      };

    case "SET_CREATE_TARGET":
      if (state.type === "create") {
        return { ...state, target: action.target };
      }
      return state;

    case "TOGGLE_CREATE_PLOT":
      if (state.type === "create") {
        const isSelected = state.selectedPlotIds.includes(action.plotId);
        return {
          ...state,
          selectedPlotIds: isSelected
            ? state.selectedPlotIds.filter((id) => id !== action.plotId)
            : [...state.selectedPlotIds, action.plotId],
        };
      }
      return state;

    case "ENTER_MEADOW_ADJUST":
      return {
        type: "meadowAdjust",
        meadowId: action.meadowId,
        activePartIndex: 0,
        editedParts: [],
      };

    case "ADVANCE_MEADOW_PART":
      if (state.type === "meadowAdjust") {
        return {
          ...state,
          activePartIndex: state.activePartIndex + 1,
          editedParts: [...state.editedParts, action.editedPart],
        };
      }
      return state;

    case "SET_CREATE_ACTION":
      if (state.type === "create") {
        return { ...state, drawingAction: action.action };
      }
      return state;

    case "SET_CREATE_POLYGON":
      if (state.type === "create") {
        return { ...state, newPolygon: action.polygon };
      }
      return state;

    case "EXIT_MODE":
      if (state.type === "view") return state;
      // Return to view mode, keeping selected plot if coming from a plot-specific mode
      const selectedPlotId =
        state.type === "split"
          ? state.plotId
          : state.type === "merge"
            ? state.primaryPlotId
            : state.type === "adjust"
              ? state.plotId
              : null;
      return { type: "view", selectedPlotId };

    default:
      return state;
  }
}

// --- Context ---

// archived: archived plots and meadows, drawn greyed out and read-only
export type MapVisibleLayers = {
  plots: boolean;
  meadows: boolean;
  archived: boolean;
};

type PlotsMapContextValue = {
  mode: PlotsMapMode;
  dispatch: Dispatch<PlotsMapAction>;
  plots: Plot[];
  mapRef: React.RefObject<MapRef | null>;
  cameraRef: React.RefObject<CameraRef | null>;
  drawingRef: React.RefObject<DrawingOverlayRef | null>;
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  controlsExpanded: boolean;
  setControlsExpanded: (expanded: boolean) => void;
  baseLayer: BaseLayer;
  setBaseLayer: (layer: BaseLayer) => void;
  plotColorMode: PlotColorMode;
  setPlotColorMode: (mode: PlotColorMode) => void;
  // Visible (and tappable) layers in view mode
  visibleLayers: MapVisibleLayers;
  // Empty unless the archived layer is visible
  archivedPlots: Plot[];
  archivedMeadows: Meadow[];
  selectedMeadowId: string | null;
  setSelectedMeadowId: (meadowId: string | null) => void;
  // Leaves a meadow create/adjust flow: back to view mode, or back to the screen that
  // opened the map directly in that flow (e.g. the animals section)
  exitMeadowFlow: () => void;
  meadowFlowOpenedExternally: boolean;
};

export const PlotsMapContext = createContext<PlotsMapContextValue | null>(null);

export function usePlotsMapContext() {
  const context = useContext(PlotsMapContext);
  if (!context) {
    throw new Error("usePlotsMapContext must be used within PlotsMapProvider");
  }
  return context;
}

// --- Initial state ---

export type InitialMeadowAction =
  | { type: "create" }
  | { type: "adjust"; meadowId: string };

export function createInitialMode(
  selectedPlotId?: string,
  meadowAction?: InitialMeadowAction,
): PlotsMapMode {
  if (meadowAction?.type === "create") {
    return {
      type: "create",
      target: "meadow",
      drawingAction: "choose",
      selectedPlotIds: [],
      newPolygon: null,
    };
  }
  if (meadowAction?.type === "adjust") {
    return {
      type: "meadowAdjust",
      meadowId: meadowAction.meadowId,
      activePartIndex: 0,
      editedParts: [],
    };
  }
  return { type: "view", selectedPlotId: selectedPlotId ?? null };
}
