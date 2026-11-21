import * as Sentry from "@sentry/react-native";
import { type GeoJSONSourceRef } from "@maplibre/maplibre-react-native";
import { RefObject, useEffect, useRef } from "react";

// Marks the selected features via maplibre's feature state instead of a property in
// the GeoJSON, so a selection change only restyles the layer and doesn't re-parse the
// source.
//
// Contract for a layer using it:
// - Every feature needs a top-level `id` (not only in `properties`): GeoJSONSource has
//   no promoteId prop in maplibre-react-native 11.5, and without an id
//   setFeatureState matches nothing. Features sharing an id (e.g. the parts of a
//   plot) share the state, so they highlight together.
// - Paint expressions read the state with
//   ["boolean", ["feature-state", "selected"], false], never ["get", "selected"].
// - Keep the selection out of the feature collection's memo dependencies, otherwise
//   the source is rebuilt on every selection change again.
// - Pass the feature collection as `data`: maplibre drops the state of features
//   whose data changed, so the selection is applied again after a refetch.
//
// The selection lives in native maplibre state, not in the GeoJSON: to debug a
// missing highlight, check the feature ids and the paint expressions first.
export function useSelectedFeatureState(
  sourceRef: RefObject<GeoJSONSourceRef | null>,
  selectedIds: string[],
  // The source data: new data gets the selection again, e.g. after a refetch
  data: GeoJSON.FeatureCollection,
) {
  // Ids marked as selected on the map, to unmark them when the selection changes.
  // Explicit false instead of removeFeatureState(): clearing all state raced with
  // the following setFeatureState, so a changed selection wasn't shown.
  const markedIdsRef = useRef<string[]>([]);
  // Joined, so a new array with the same ids doesn't rerun the effect
  const selectedKey = selectedIds.join(",");
  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    const nextIds = selectedKey ? selectedKey.split(",") : [];
    const unmarkIds = markedIdsRef.current.filter(
      (id) => !nextIds.includes(id),
    );
    markedIdsRef.current = nextIds;
    const updates = [
      ...unmarkIds.map((id) =>
        source.setFeatureState({ id }, { selected: false }),
      ),
      ...nextIds.map((id) =>
        source.setFeatureState({ id }, { selected: true }),
      ),
    ];
    Promise.all(updates).catch((error) => Sentry.captureException(error));
  }, [sourceRef, selectedKey, data]);
}
