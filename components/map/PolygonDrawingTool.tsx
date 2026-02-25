import { hexToRgba } from "@/theme/theme";
import { Portal } from "@gorhom/portal";
import { isEqual, throttle } from "lodash";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  LatLng,
  MapPolygonProps,
  Point,
  Polygon,
  Polyline,
} from "react-native-maps";
import { useTheme } from "styled-components/native";
import { CircleMarkers } from "./CircleMarkers";
import { CommandPalette } from "./CommandPalette";
import { MidpointCircleMarkers } from "./MidpointCircleMarkers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

export type PolygonDrawingToolActions = {
  createPolygon: () => void;
  editPolygon: (coordinates: LatLng[]) => void;
  drawToPoint: (coordinate: LatLng) => void;
  coordinates: LatLng[];
  canFinish: boolean;
};

export type DrawAction = "select" | "edit" | "draw";

export type PolygonDrawingToolProps = {
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  initialAction?: DrawAction;
  initialPolygonCoordinates?: LatLng[];
  onDrawActionChange?: (action: DrawAction) => void;
  magnifierMapContent?: React.ReactNode[];
  portalName?: string;
  finishIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onCanFinishChange?: (canFinish: boolean) => void;
  onFinish?: (coordinates: LatLng[]) => void;
  onInfo?: () => void;
  showActions?: boolean;
};

const emptyPolygon: MapPolygonProps = {
  coordinates: [],
};

export const PolygonDrawingTool = forwardRef<
  PolygonDrawingToolActions,
  PolygonDrawingToolProps
>(
  (
    {
      initialAction = "select",
      initialPolygonCoordinates = [],
      showActions = true,
      onDrawActionChange,
      portalName,
      strokeColor,
      fillColor,
      strokeWidth,
      magnifierMapContent,
      finishIcon,
      onFinish,
      onCanFinishChange,
      onInfo,
    }: PolygonDrawingToolProps,
    ref,
  ) => {
    const theme = useTheme();
    const [polygon, setPolygon] = useState<MapPolygonProps>({
      coordinates: initialPolygonCoordinates,
      strokeColor: strokeColor ?? theme.colors.yellow,
      fillColor:
        fillColor ??
        hexToRgba(theme.colors.success, theme.map.defaultFillAlpha),
      strokeWidth: strokeWidth ?? 2,
    });
    const [editOverlayPolygon, setEditOverlayPolygon] =
      useState<MapPolygonProps>({
        coordinates: [],
        fillColor: hexToRgba(
          theme.colors.secondary,
          theme.map.defaultFillAlpha,
        ),
        strokeColor: theme.colors.yellow,
        strokeWidth: 2,
      });

    const [coordinatesStack, setCoordinatesStack] = useState<LatLng[][]>([
      initialPolygonCoordinates,
    ]);

    const [action, setAction] = useState<DrawAction>(initialAction);
    // const magnifierX = useSharedValue(0);
    // const magnifierY = useSharedValue(0);
    // const [dragging, setDragging] = useState(false);

    useImperativeHandle(ref, () => ({
      createPolygon: onDraw,
      editPolygon,
      drawToPoint,
      coordinates: polygon.coordinates,
      canFinish: polygon.coordinates.length > 2,
    }));

    // const mapContentWithPolygon = useMemo(
    //   () => (
    //     <>
    //       {magnifierMapContent}
    //       <Polygon {...polygon} />
    //       <Polygon {...editOverlayPolygon} />
    //     </>
    //   ),
    //   [polygon, editOverlayPolygon, magnifierMapContent]
    // );

    // const magnifierMapRef = React.useRef<MapView>(null);

    // const magnifierSize = 120;

    function onDraw() {
      if (action !== "select") {
        setPolygon({
          coordinates: initialPolygonCoordinates,
          fillColor: hexToRgba(
            theme.colors.success,
            theme.map.defaultFillAlpha,
          ),
          strokeColor: theme.colors.yellow,
          strokeWidth: 2,
        });
        setCoordinatesStack([[]]);
        setAction("select");
        onDrawActionChange && onDrawActionChange("select");
      } else {
        setAction("draw");
        onDrawActionChange && onDrawActionChange("draw");
      }
    }

    function editPolygon(coordinates: LatLng[]) {
      setPolygon({
        coordinates,
        strokeColor: strokeColor ?? theme.colors.yellow,
        fillColor:
          fillColor ??
          hexToRgba(theme.colors.success, theme.map.defaultFillAlpha),
        strokeWidth: strokeWidth ?? 2,
      });
      setAction("edit");
      onDrawActionChange && onDrawActionChange("edit");
    }

    function onUndo() {
      if (coordinatesStack.length === 1) {
        return;
      }
      const previousState = coordinatesStack[coordinatesStack.length - 2];
      if (
        action !== "draw" &&
        !isEqual(previousState[0], previousState[previousState.length - 1])
      ) {
        setAction("draw");
        onDrawActionChange && onDrawActionChange("draw");
      }
      setPolygon((prev) => ({
        ...prev,
        coordinates: previousState,
      }));
      setCoordinatesStack((prev) => prev.slice(0, -1));
    }

    function onDelete() {
      setPolygon({
        coordinates: [],
        strokeColor: strokeColor ?? theme.colors.yellow,
        fillColor:
          fillColor ??
          hexToRgba(theme.colors.success, theme.map.defaultFillAlpha),
        strokeWidth: strokeWidth ?? 2,
      });
      if (action !== "draw") {
        setAction("draw");
        onDrawActionChange && onDrawActionChange("draw");
        onCanFinishChange && onCanFinishChange(false);
      }
      setCoordinatesStack([[]]);
    }

    function drawToPoint(coordinate: LatLng) {
      if (!polygon || action !== "draw") {
        return;
      }
      setPolygon((prev) => ({
        ...prev,
        coordinates: [...prev.coordinates, coordinate],
      }));
      setCoordinatesStack((prev) => [
        ...prev,
        [...prev[prev.length - 1], coordinate],
      ]);
    }

    function finish() {
      const currentPolygon = { ...polygon };
      if (currentPolygon.coordinates.length < 3) {
        return;
      }
      if (
        currentPolygon.coordinates[0] !==
        currentPolygon.coordinates[currentPolygon.coordinates.length - 1]
      ) {
        currentPolygon.coordinates = [
          ...currentPolygon.coordinates,
          currentPolygon.coordinates[0],
        ];
      }

      setPolygon({
        coordinates: [],
        strokeColor: strokeColor ?? theme.colors.yellow,
        fillColor:
          fillColor ??
          hexToRgba(theme.colors.success, theme.map.defaultFillAlpha),
        strokeWidth: strokeWidth ?? 2,
      });
      setAction("select");
      onDrawActionChange && onDrawActionChange("select");
      onFinish && onFinish(currentPolygon.coordinates);
    }

    const drawModifiedPolygon = useMemo(
      () =>
        throttle(
          (index: number, coordinate: LatLng) => {
            setEditOverlayPolygon((prev) => {
              const coordinates = [...prev.coordinates];
              coordinates[index] = coordinate;
              return {
                ...prev,
                coordinates,
              };
            });
          },
          50,
          { leading: true, trailing: false },
        ),
      [],
    );

    function onDrag(coordinate: LatLng, position: Point) {
      // if (!dragging) {
      //   setDragging(true);
      // }
      // magnifierX.value = position.x;
      // magnifierY.value = position.y;
      // magnifierMapRef.current?.setCamera({
      //   center: coordinate,
      //   pitch: 0,
      //   heading: 0,
      //   //android
      //   // zoom: 18,
      //   //ios
      //   altitude: 1,
      // });
    }

    function onCircleDragStart(
      index: number,
      coordinate: LatLng,
      position?: Point,
    ) {
      setEditOverlayPolygon((prev) => ({
        ...prev,
        coordinates: polygon.coordinates.slice(
          0,
          polygon.coordinates.length - 1,
        ),
      }));
    }

    function onCircleDragEnd(
      index: number,
      coordinate: LatLng,
      position?: Point,
    ) {
      setEditOverlayPolygon((prev) => ({
        ...prev,
        coordinates: [],
      }));
      setPolygon((prev) => {
        const coordinates = [...prev.coordinates];
        coordinates[index] = coordinate;
        if (index === 0 && action === "edit") {
          // if its the first coordinate we also need to ajust the last one which has to be the same
          coordinates[coordinates.length - 1] = coordinate;
        }
        return {
          ...prev,
          coordinates,
        };
      });
      setCoordinatesStack((prev) => {
        const coordinates = [...prev[prev.length - 1]];
        coordinates[index] = coordinate;
        if (index === 0 && action === "edit") {
          // if its the first coordinate we also need to ajust the last one which has to be the same
          coordinates[coordinates.length - 1] = coordinate;
        }
        return [...prev, coordinates];
      });
      // setDragging(false);
    }
    function onCircleDrag(index: number, coordinate: LatLng, position: Point) {
      onDrag(coordinate, position);
      drawModifiedPolygon(index, coordinate);
    }

    function onCirclePress(index: number, coordinate: LatLng) {
      if (index === 0 && action === "draw") {
        setPolygon((prev) => ({
          ...prev,
          coordinates: [...prev.coordinates, prev.coordinates[0]],
        }));
        setCoordinatesStack((prev) => [
          ...prev,
          [...prev[prev.length - 1], prev[prev.length - 1][0]],
        ]);
        setAction("edit");
        onCanFinishChange && onCanFinishChange(true);
      }
    }

    function onMidcircleDrag(
      index: number,
      coordinate: LatLng,
      position: Point,
    ) {
      onDrag(coordinate, position);
      drawModifiedPolygon(index, coordinate);
    }

    function onMidpointCircleDragStart(
      index: number,
      coordinate: LatLng,
      position?: Point,
    ) {
      setEditOverlayPolygon((prev) => {
        const coordinates = polygon.coordinates.slice(
          0,
          polygon.coordinates.length - 1,
        );

        coordinates.splice(index, 0, coordinate);
        return {
          ...prev,
          coordinates,
        };
      });
    }

    function onMidpointCircleDragEnd(
      index: number,
      coordinate: LatLng,
      position?: Point,
    ) {
      setEditOverlayPolygon((prev) => ({
        ...prev,
        coordinates: [],
      }));
      setPolygon((prev) => {
        const coordinates = [...prev.coordinates];

        coordinates.splice(index, 0, coordinate);
        return {
          ...prev,
          coordinates,
        };
      });

      setCoordinatesStack((prev) => {
        const coordinates = [...prev[prev.length - 1]];
        coordinates.splice(index, 0, coordinate);
        return [...prev, coordinates];
      });
      // setDragging(false);
    }
    let markerCoordinates = useMemo(() => {
      if (action === "edit") {
        const coordinates = [...polygon.coordinates];
        // first and last are the same so we have to remove one of them
        return coordinates.slice(0, coordinates.length - 1);
      }
      return polygon.coordinates;
    }, [polygon, action]);
    return (
      <>
        <Portal hostName={portalName}>
          {showActions ? (
            <CommandPalette
              action={action}
              onDraw={onDraw}
              onUndo={onUndo}
              onDelete={onDelete}
              onFinish={finish}
              onInfo={onInfo}
              canFinish={polygon.coordinates.length > 2}
              finishIcon={finishIcon}
            />
          ) : (
            // currently the polygon does not render properly without the command palette, dont ask me why
            <View style={{ opacity: 0 }}>
              <CommandPalette
                action={action}
                onDraw={onDraw}
                onUndo={onUndo}
                onDelete={onDelete}
                onFinish={finish}
                onInfo={onInfo}
                canFinish={polygon.coordinates.length > 2}
                finishIcon={finishIcon}
              />
            </View>
          )}
          {/* {action === "edit" && Platform.OS === "ios" ? (
            <MagnifierGlass
              ref={magnifierMapRef}
              visible={dragging}
              magnifierSize={magnifierSize}
              magnifierX={magnifierX}
              magnifierY={magnifierY}
              mapContent={mapContentWithPolygon}
            />
          ) : null} */}
        </Portal>
        {polygon.coordinates.length ? (
          <>
            {action === "draw" ? (
              <Polyline
                coordinates={polygon.coordinates}
                fillColor={polygon.strokeColor}
                strokeWidth={2}
              />
            ) : (
              <>
                {editOverlayPolygon.coordinates.length > 0 &&
                editOverlayPolygon.coordinates.length < 50 ? (
                  <Polygon {...editOverlayPolygon} />
                ) : null}
                <Polygon {...polygon} />
                {markerCoordinates.length < 50 ? (
                  <MidpointCircleMarkers
                    coordinates={markerCoordinates}
                    onDrag={onMidcircleDrag}
                    onDragStart={onMidpointCircleDragStart}
                    onDragEnd={onMidpointCircleDragEnd}
                    onPress={onCirclePress}
                  />
                ) : null}
              </>
            )}
            {markerCoordinates.length > 0 ? (
              <CircleMarkers
                coordinates={markerCoordinates}
                onDrag={onCircleDrag}
                onDragStart={onCircleDragStart}
                onDragEnd={onCircleDragEnd}
                onPress={onCirclePress}
              />
            ) : null}
          </>
        ) : null}
      </>
    );
  },
);
