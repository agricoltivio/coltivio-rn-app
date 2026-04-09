import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";

type SpeedDialItem = {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};

type SpeedDialProps = {
  items: SpeedDialItem[];
};

const MAIN_SIZE = 82;
const SUB_SIZE = 52;
const RADIUS = 140;
const TIMING_CONFIG = { duration: 220, easing: Easing.out(Easing.quad) };

export function SpeedDial({ items }: SpeedDialProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { localSettings } = useLocalSettings();
  const isOpen = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState(false);

  const fabBottom = theme.spacing.m;
  const fabRight = theme.spacing.m;

  const open = useCallback(() => {
    // Show onboarding on first open
    if (!localSettings.speedDialOnboardingCompleted) {
      navigation.navigate("SpeedDialOnboarding" as never);
      return;
    }
    setModalVisible(true);
    isOpen.value = withTiming(1, TIMING_CONFIG);
  }, [isOpen, localSettings.speedDialOnboardingCompleted, navigation]);

  const close = useCallback(() => {
    isOpen.value = withTiming(0, TIMING_CONFIG);
    setTimeout(() => setModalVisible(false), TIMING_CONFIG.duration);
  }, [isOpen]);

  function handleItemPress(onPress: () => void) {
    close();
    onPress();
  }

  const mainAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(isOpen.value, [0, 1], [0, 45])}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: isOpen.value,
  }));

  const fabButton = (onPress: () => void) => (
    <View style={{ position: "absolute", bottom: fabBottom, right: fabRight }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Animated.View
          style={[
            {
              width: MAIN_SIZE,
              height: MAIN_SIZE,
              borderRadius: MAIN_SIZE / 2,
              shadowColor: theme.colors.buttonPrimary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.7,
              shadowRadius: 5,
              elevation: 8,
            },
            mainAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={[
              `${theme.colors.buttonPrimary}dd`,
              theme.colors.buttonPrimary,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: MAIN_SIZE,
              height: MAIN_SIZE,
              borderRadius: MAIN_SIZE / 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={30} color={theme.colors.white} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      {/* FAB when modal is closed */}
      {!modalVisible && fabButton(open)}

      {/* Full-screen modal covers header + status bar */}
      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={close}
      >
        {/* Backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.3)" },
            ]}
            onPress={close}
          />
        </Animated.View>

        {/* Sub-buttons */}
        {items.map((item, index) => (
          <SpeedDialSubButton
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            isOpen={isOpen}
            fabBottom={fabBottom}
            fabRight={fabRight}
            onPress={() => handleItemPress(item.onPress)}
          />
        ))}

        {/* FAB inside modal */}
        {fabButton(close)}
      </Modal>
    </>
  );
}

function SpeedDialSubButton({
  item,
  index,
  total,
  isOpen,
  fabBottom,
  fabRight,
  onPress,
}: {
  item: SpeedDialItem;
  index: number;
  total: number;
  isOpen: SharedValue<number>;
  fabBottom: number;
  fabRight: number;
  onPress: () => void;
}) {
  const theme = useTheme();

  // Quarter-circle arc from 90° (directly above) to 180° (directly left)
  const angle =
    total === 1
      ? (Math.PI * 3) / 4
      : Math.PI / 2 + (index / (total - 1)) * (Math.PI / 2);

  const targetX = Math.cos(angle) * RADIUS;
  const targetY = -Math.sin(angle) * RADIUS;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: targetX * isOpen.value },
      { translateY: targetY * isOpen.value },
    ],
    opacity: isOpen.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: fabBottom + (MAIN_SIZE - SUB_SIZE) / 2,
          right: fabRight + (MAIN_SIZE - SUB_SIZE) / 2,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.colors.white,
          width: SUB_SIZE,
          height: SUB_SIZE,
          borderRadius: SUB_SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          shadowOffset: { width: 1, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
