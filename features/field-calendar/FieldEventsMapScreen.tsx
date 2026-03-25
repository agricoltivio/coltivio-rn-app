import { MapLibreMap } from "@/components/map/MapLibreMap";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import {
  GeoJSONSource,
  Layer,
  Marker,
  type CameraRef,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import type { FeatureCollection } from "geojson";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useFieldEventsQuery } from "./field-calendar.hooks";
import { FieldEventsMapScreenProps } from "./navigation/field-calendar.routes";
import type { FieldEvent } from "@/api/field-events.api";

const EVENT_COLORS: Record<FieldEvent["type"], string> = {
  harvest: "#22c55e",
  fertilizerApplication: "#3b82f6",
  cropProtectionApplication: "#f97316",
  tillage: "#8b5cf6",
};

// Label floats up and fades out over this duration (ms), matching the web app
const LABEL_LIFETIME_MS = 5000;
// Duration between events at 1× speed (ms)
const BASE_INTERVAL_MS = 1800;
const SPEEDS = [1, 2, 5] as const;
type Speed = (typeof SPEEDS)[number];

type ActiveLabel = {
  key: string;
  lng: number;
  lat: number;
  plotName: string;
  action: string;
  type: FieldEvent["type"];
};

const EMPTY_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// Floating label that rises and fades out — rendered as a geo-anchored Marker
function FloatingLabel({
  lng,
  lat,
  plotName,
  action,
  type,
}: Omit<ActiveLabel, "key">) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const color = EVENT_COLORS[type];

  useEffect(() => {
    Animated.sequence([
      // Pop in quickly
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -14,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Float up and fade out over remaining lifetime
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: LABEL_LIFETIME_MS - 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -90,
          duration: LABEL_LIFETIME_MS - 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Marker lngLat={[lng, lat] as LngLat} anchor="bottom">
      <Animated.View
        style={{ opacity, transform: [{ translateY }], alignItems: "center" }}
      >
        <View
          style={{
            backgroundColor: color,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
            {plotName}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
            {action}
          </Text>
        </View>
        {/* Callout triangle pointing down to the location */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 5,
            borderRightWidth: 5,
            borderTopWidth: 6,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: color,
          }}
        />
      </Animated.View>
    </Marker>
  );
}

function startOfYear(year: number): Date {
  return new Date(year, 0, 1);
}

function endOfYear(year: number): Date {
  return new Date(year, 11, 31, 23, 59, 59);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
  });
}

export function FieldEventsMapScreen({
  navigation,
}: FieldEventsMapScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { farm } = useFarmQuery();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [playedFeatures, setPlayedFeatures] =
    useState<FeatureCollection>(EMPTY_GEOJSON);
  const [activeLabels, setActiveLabels] = useState<ActiveLabel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  // Delay map mount by one frame to avoid layout-before-dimensions (same as PlotsMapScreen)
  const [mapVisible, setMapVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMapVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const cameraRef = useRef<CameraRef | null>(null);
  // Keep a ref so the interval callback always reads the latest index without deps
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const fromDate = useMemo(() => startOfYear(year), [year]);
  const toDate = useMemo(() => endOfYear(year), [year]);
  const { data: events } = useFieldEventsQuery(fromDate, toDate);

  // Sort events by date; keep a ref so stepEvent always gets the latest without deps
  const sortedEvents = useMemo(
    () => [...(events ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );
  const sortedEventsRef = useRef(sortedEvents);
  sortedEventsRef.current = sortedEvents;

  // Fly to farm location when map is ready
  useEffect(() => {
    if (!mapVisible || !farm?.location?.coordinates) return;
    const [lng, lat] = farm.location.coordinates;
    cameraRef.current?.flyTo({
      center: [lng, lat] as LngLat,
      zoom: 14,
      duration: 800,
    });
  }, [mapVisible]);

  function reset() {
    setIsPlaying(false);
    setCurrentIndex(0);
    setPlayedFeatures(EMPTY_GEOJSON);
    setActiveLabels([]);
    setCurrentDate(null);
  }

  // Reset when year changes or new events load
  useEffect(() => {
    reset();
  }, [year, events]);

  function stepEvent(index: number) {
    const ev = sortedEventsRef.current[index];
    if (!ev) return;

    const center = turf.centerOfMass({
      type: "Feature",
      geometry: ev.geometry,
      properties: {},
    });
    const [lng, lat] = center.geometry.coordinates;

    // Follow each event — fly to its centroid at zoom 16
    cameraRef.current?.flyTo({
      center: [lng, lat] as LngLat,
      zoom: 16,
      duration: 900,
    });

    setCurrentDate(ev.date);

    // Accumulate polygon features. Flatten MultiPolygon → Polygon so MapLibre RN renders correctly.
    setPlayedFeatures((prev) => ({
      type: "FeatureCollection",
      features: [
        ...prev.features,
        ...ev.geometry.coordinates.map((polygonCoords) => ({
          type: "Feature" as const,
          geometry: { type: "Polygon" as const, coordinates: polygonCoords },
          properties: { color: EVENT_COLORS[ev.type] },
        })),
      ],
    }));

    // Show a floating label at the centroid; remove it after LABEL_LIFETIME_MS
    const labelKey = `${ev.id}-${index}-${Date.now()}`;
    setActiveLabels((prev) => [
      ...prev,
      {
        key: labelKey,
        lng,
        lat,
        plotName: ev.plotName,
        action: ev.action,
        type: ev.type,
      },
    ]);
    setTimeout(() => {
      setActiveLabels((prev) => prev.filter((l) => l.key !== labelKey));
    }, LABEL_LIFETIME_MS);
  }

  // Playback interval — restarts when isPlaying or speed changes
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = BASE_INTERVAL_MS / speed;
    const interval = setInterval(() => {
      const idx = currentIndexRef.current;
      if (idx >= sortedEventsRef.current.length) {
        setIsPlaying(false);
        return;
      }
      stepEvent(idx);
      setCurrentIndex(idx + 1);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const farmCenter: LngLat = farm?.location?.coordinates
    ? (farm.location.coordinates as LngLat)
    : [7.4474, 46.9481];

  const done = currentIndex >= sortedEvents.length && sortedEvents.length > 0;
  const progress =
    sortedEvents.length > 0 ? currentIndex / sortedEvents.length : 0;

  return (
    <View style={styles.container}>
      <MapLibreMap
        loading={!mapVisible}
        initialCenter={farmCenter}
        initialZoom={14}
        cameraRef={cameraRef}
      >
        <GeoJSONSource id="field-events" data={playedFeatures}>
          <Layer
            type="fill"
            id="field-events-fill"
            paint={{ "fill-color": ["get", "color"], "fill-opacity": 0.55 }}
          />
          <Layer
            type="line"
            id="field-events-stroke"
            paint={{
              "line-color": ["get", "color"],
              "line-width": 1.5,
              "line-opacity": 0.9,
            }}
          />
        </GeoJSONSource>

        {activeLabels.map((label) => (
          <FloatingLabel
            key={label.key}
            lng={label.lng}
            lat={label.lat}
            plotName={label.plotName}
            action={label.action}
            type={label.type}
          />
        ))}
      </MapLibreMap>

      {/* Back button — top left */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Current date — top center, only shown once playback starts */}
      {currentDate && (
        <View
          style={[styles.dateDisplay, { top: insets.top + 12 }]}
          pointerEvents="none"
        >
          <View style={styles.pill}>
            <Text style={styles.pillText}>{formatDate(currentDate)}</Text>
          </View>
        </View>
      )}

      {/* Year selector — top right */}
      <View style={[styles.yearSelector, { top: insets.top + 12 }]}>
        <View style={styles.pill}>
          <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.pillText, { marginHorizontal: 6 }]}>{year}</Text>
          <TouchableOpacity
            onPress={() => setYear((y) => y + 1)}
            disabled={year >= currentYear}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={year >= currentYear ? "#555" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* No events message — centered between top bar and bottom controls */}
      {events !== undefined && events.length === 0 && (
        <View style={styles.noEventsOverlay} pointerEvents="none">
          <View style={styles.noEventsBadge}>
            <Text style={styles.noEventsText}>
              {t("field_calendar.no_events_for_year")}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom controls — hidden when no events */}
      <View
        style={[
          styles.bottomControls,
          { paddingBottom: insets.bottom + 12 },
          events !== undefined && events.length === 0 && { display: "none" },
        ]}
      >
        {/* Legend */}
        <View style={styles.legendRow}>
          {(Object.entries(EVENT_COLORS) as [FieldEvent["type"], string][]).map(
            ([eventType, color]) => (
              <View key={eventType} style={styles.legendChip}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>
                  {t(`field_calendar.event_type.${eventType}`)}
                </Text>
              </View>
            ),
          )}
        </View>

        {/* Controls row */}
        <View style={styles.controlsRow}>
          {done ? (
            <TouchableOpacity onPress={reset} style={styles.playButton}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsPlaying((p) => !p)}
              style={styles.playButton}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          )}

          <View style={styles.speedButtons}>
            {SPEEDS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSpeed(s)}
                style={[
                  styles.speedButton,
                  speed === s && styles.speedButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.speedText,
                    speed === s && styles.speedTextActive,
                  ]}
                >
                  {s}×
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>

          <Text style={styles.progressText}>
            {currentIndex}/{sortedEvents.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateDisplay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  yearSelector: {
    position: "absolute",
    right: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noEventsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  noEventsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "#fff",
    fontSize: 11,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  speedButtons: {
    flexDirection: "row",
    gap: 4,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  speedButtonActive: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  speedText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  speedTextActive: {
    color: "#fff",
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  progressText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
});
