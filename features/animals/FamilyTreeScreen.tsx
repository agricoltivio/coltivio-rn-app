import { FamilyTreeEdge, FamilyTreeNode } from "@/api/animals.api";
import { ContentView } from "@/components/containers/ContentView";
import { Subtitle } from "@/theme/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dagre from "@dagrejs/dagre";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Line, Svg } from "react-native-svg";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery, useFamilyTreeQuery } from "./animals.hooks";
import { FamilyTreeScreenProps } from "./navigation/animals-routes";
import { AnimalType } from "@/api/animals.api";

const NODE_W = 130;
const NODE_H = 70;

type LayoutMap = Record<string, { x: number; y: number }>;

function buildLayout(
  nodes: FamilyTreeNode[],
  edges: FamilyTreeEdge[],
): { layoutMap: LayoutMap; canvasWidth: number; canvasHeight: number } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 24, ranksep: 52, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  }
  for (const e of edges) {
    // dagre edge: parentId → childId (top-down)
    g.setEdge(e.parentId, e.childId);
  }
  dagre.layout(g);
  const layoutMap: LayoutMap = {};
  for (const n of nodes) {
    const pos = g.node(n.id);
    // dagre gives center x/y, convert to top-left
    layoutMap[n.id] = { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 };
  }
  const graph = g.graph();
  return {
    layoutMap,
    canvasWidth: graph.width ?? 0,
    canvasHeight: graph.height ?? 0,
  };
}

function TypePickerModal({
  visible,
  availableTypes,
  onSelect,
}: {
  visible: boolean;
  availableTypes: AnimalType[];
  onSelect: (type: AnimalType) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: theme.colors.white, borderRadius: 14, padding: theme.spacing.l, width: 280 }}>
          <Subtitle style={{ fontWeight: "600", marginBottom: theme.spacing.m, textAlign: "center" }}>
            {t("animals.select_type_for_tree")}
          </Subtitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.s, justifyContent: "center" }}>
            {availableTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => onSelect(type)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Subtitle style={{ color: theme.colors.white, fontSize: 14 }}>
                  {t(`animals.animal_types.${type}`)}
                </Subtitle>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function FamilyTreeScreen({ route, navigation }: FamilyTreeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { animalType: initialType, focusedAnimalId } = route.params ?? {};
  const [animalType, setAnimalType] = useState<AnimalType | undefined>(initialType);
  const [showTypePicker, setShowTypePicker] = useState(!initialType);
  const [selectedId, setSelectedId] = useState<string | null>(focusedAnimalId ?? null);
  const [hideDead, setHideDead] = useState(false);

  const { animals } = useAnimalsQuery(false);
  const availableTypes = useMemo<AnimalType[]>(
    () => [...new Set(animals?.map((a) => a.type) ?? [])],
    [animals],
  );

  const { familyTree, isLoading } = useFamilyTreeQuery(animalType ?? ("goat" as AnimalType));

  // Pan + zoom gesture state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Filter nodes/edges based on hideDead
  const { nodes, edges } = useMemo(() => {
    if (!familyTree) return { nodes: [], edges: [] };
    const filteredNodes = hideDead
      ? familyTree.nodes.filter((n) => !n.dateOfDeath)
      : familyTree.nodes;
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = familyTree.edges.filter(
      (e) => nodeIds.has(e.parentId) && nodeIds.has(e.childId),
    );
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [familyTree, hideDead]);

  const { layoutMap, canvasWidth, canvasHeight } = useMemo(
    () => (nodes.length > 0 ? buildLayout(nodes, edges) : { layoutMap: {}, canvasWidth: 0, canvasHeight: 0 }),
    [nodes, edges],
  );

  // Auto-center on focused animal once layout is ready
  const centeredRef = useRef(false);
  useEffect(() => {
    if (!focusedAnimalId || centeredRef.current) return;
    const pos = layoutMap[focusedAnimalId];
    if (!pos) return;
    centeredRef.current = true;
    const x = -(pos.x + NODE_W / 2) + screenWidth / 2;
    const y = -(pos.y + NODE_H / 2) + (screenHeight / 2);
    translateX.value = x;
    translateY.value = y;
    savedX.value = x;
    savedY.value = y;
  }, [layoutMap, focusedAnimalId]);

  // Connected node ids for highlight
  const connectedIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.parentId === selectedId) ids.add(e.childId);
      if (e.childId === selectedId) ids.add(e.parentId);
    }
    return ids;
  }, [selectedId, edges]);

  // maxPointers(1) prevents pan from firing during pinch (two fingers), avoiding conflicts
  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      // Capture the world point under the initial focal point as the zoom anchor
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      const newScale = Math.max(0.3, Math.min(3, savedScale.value * e.scale));
      // e.focalX/Y is the CURRENT midpoint of the two fingers — project the initial
      // anchor world point to that screen position so the focal point never drifts
      translateX.value = e.focalX - (focalX.value - savedX.value) * (newScale / savedScale.value);
      translateY.value = e.focalY - (focalY.value - savedY.value) * (newScale / savedScale.value);
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  function handleTypeSelect(type: AnimalType) {
    setAnimalType(type);
    setShowTypePicker(false);
    centeredRef.current = false;
    setSelectedId(null);
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedX.value = 0;
    savedY.value = 0;
  }

  const hasSelection = selectedId !== null;

  return (
    <ContentView headerVisible>
      <TypePickerModal visible={showTypePicker} availableTypes={availableTypes} onSelect={handleTypeSelect} />

      {/* Toolbar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: theme.spacing.xs,
        }}
      >
        {/* Type picker button */}
        <TouchableOpacity
          onPress={() => setShowTypePicker(true)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
          }}
        >
          <Subtitle style={{ color: theme.colors.white, fontSize: 13 }}>
            {animalType ? t(`animals.animal_types.${animalType}`) : t("animals.select_type_for_tree")}
          </Subtitle>
        </TouchableOpacity>

        {/* Hide dead toggle */}
        <TouchableOpacity
          onPress={() => setHideDead((v) => !v)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: hideDead ? theme.colors.primary : theme.colors.white,
            borderWidth: 1,
            borderColor: hideDead ? theme.colors.primary : theme.colors.gray3,
          }}
        >
          <Subtitle
            style={{
              color: hideDead ? theme.colors.white : theme.colors.gray1,
              fontSize: 13,
            }}
          >
            {t("animals.hide_dead")}
          </Subtitle>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <GestureDetector gesture={combinedGesture}>
        <View style={{ flex: 1, overflow: "hidden" }}>
          {isLoading && animalType ? (
            <ActivityIndicator style={{ marginTop: theme.spacing.xl }} color={theme.colors.primary} />
          ) : !animalType || nodes.length === 0 ? (
            <Subtitle style={{ marginTop: theme.spacing.m }}>{t("common.no_entries")}</Subtitle>
          ) : (
            <Animated.View style={[{ width: canvasWidth, height: canvasHeight, transformOrigin: 'top left' }, animatedStyle]}>
              {/* SVG edges */}
              <Svg
                style={{ position: "absolute", top: 0, left: 0 }}
                width={canvasWidth}
                height={canvasHeight}
              >
                {edges.map((edge, idx) => {
                  const from = layoutMap[edge.parentId];
                  const to = layoutMap[edge.childId];
                  if (!from || !to) return null;
                  const highlighted = hasSelection && (edge.parentId === selectedId || edge.childId === selectedId);
                  const dimmed = hasSelection && !highlighted;
                  return (
                    <Line
                      key={idx}
                      x1={from.x + NODE_W / 2}
                      y1={from.y + NODE_H}
                      x2={to.x + NODE_W / 2}
                      y2={to.y}
                      stroke={highlighted ? theme.colors.primary : theme.colors.gray3}
                      strokeWidth={highlighted ? 2 : 1.5}
                      opacity={dimmed ? 0.15 : 1}
                    />
                  );
                })}
              </Svg>

              {/* Node cards */}
              {nodes.map((node) => {
                const pos = layoutMap[node.id];
                if (!pos) return null;
                const isSelected = node.id === selectedId;
                const isConnected = connectedIds.has(node.id);
                const isDead = !!node.dateOfDeath;
                const dimmed = hasSelection && !isSelected && !isConnected;
                return (
                  <TouchableOpacity
                    key={node.id}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                      width: NODE_W,
                      height: NODE_H,
                      backgroundColor: theme.colors.white,
                      borderRadius: 8,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.gray3,
                      padding: 6,
                      opacity: dimmed ? 0.18 : isDead && !isSelected ? 0.5 : 1,
                      justifyContent: "center",
                    }}
                    activeOpacity={0.7}
                    onPress={() => setSelectedId((id) => (id === node.id ? null : node.id))}
                  >
                    <Text numberOfLines={1} style={{ fontWeight: "600", fontSize: 13, color: theme.colors.text }}>
                      {node.name}
                    </Text>
                    {node.earTagNumber && (
                      <Text numberOfLines={1} style={{ fontSize: 11, color: theme.colors.gray2 }}>
                        {node.earTagNumber}
                      </Text>
                    )}
                    {(() => {
                      const endDate = node.dateOfDeath ? new Date(node.dateOfDeath) : new Date();
                      const ageMonths = Math.floor((endDate.getTime() - new Date(node.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                      const ageLabel = ageMonths < 12 ? `${ageMonths}m` : `${Math.floor(ageMonths / 12)}y`;
                      return (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          <Text style={{ fontSize: 11, color: theme.colors.gray2 }}>{ageLabel}</Text>
                          {node.dateOfDeath && (
                            <MaterialCommunityIcons name="cross" size={12} color={theme.colors.gray2} />
                          )}
                        </View>
                      );
                    })()}
                    {isSelected && (
                      <TouchableOpacity
                        onPress={() => navigation.navigate("AnimalDetails", { animalId: node.id })}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        style={{ position: "absolute", top: 4, right: 4 }}
                      >
                        <MaterialCommunityIcons name="open-in-new" size={14} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}
        </View>
      </GestureDetector>
    </ContentView>
  );
}
