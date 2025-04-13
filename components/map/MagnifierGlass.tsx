import { forwardRef } from "react";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "styled-components/native";

export type MagnifierGlassProps = {
  magnifierX: SharedValue<number>;
  magnifierY: SharedValue<number>;
  visible: boolean;
  magnifierSize: number;
  mapContent?: React.ReactNode;
};

export const MagnifierGlass = forwardRef<MapView, MagnifierGlassProps>(
  ({ magnifierSize, magnifierX, magnifierY, visible, mapContent }, ref) => {
    const theme = useTheme();

    const magnifierStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: magnifierX.value - magnifierSize / 2 },
        { translateY: magnifierY.value - magnifierSize - 35 },
      ],
    }));
    return (
      <Animated.View
        style={[
          {
            opacity: visible ? 1 : 0,
            position: "absolute",
            top: 0,
            left: 0,
            width: magnifierSize,
            height: magnifierSize,
            borderRadius: magnifierSize / 2,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "#000",
          },
          magnifierStyle,
        ]}
      >
        <MapView
          ref={ref}
          mapType="satellite"
          style={{
            width: magnifierSize,
            height: magnifierSize,
          }}
          pointerEvents="none" // Disable interactions on the magnifier
          zoomEnabled={false}
          scrollEnabled={false}
        >
          {mapContent}
        </MapView>
        <View
          style={[
            {
              borderColor: theme.colors.white,
              // backgroundColor: "#fff",
              backgroundColor: "rgba(255, 255, 255, .5)",
              borderRadius: 100,
              borderWidth: 1,
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 18,
              height: 18,
              transform: [{ translateX: -9 }, { translateY: -9 }],
            },
          ]}
        />
      </Animated.View>
    );
  }
);
