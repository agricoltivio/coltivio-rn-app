import { Card } from "@/components/card/Card";
import { Subtitle } from "@/theme/Typography";
import { Platform } from "react-native";
import { Marker } from "react-native-maps";
import { useTheme } from "styled-components/native";

export type LabelMarkerProps = {
  longitude: number;
  latitude: number;
  text: string;
};

export function LabelMarker({ latitude, longitude, text }: LabelMarkerProps) {
  const theme = useTheme();
  // if (Platform.OS === "android") {
  //   return null;
  // }
  return (
    <Marker
      coordinate={{
        longitude,
        latitude,
      }}
      tracksViewChanges
      zIndex={100}
    >
      <Card
        style={{
          padding: theme.spacing.xxs,
        }}
      >
        <Subtitle style={{ fontSize: 13 }}>{text}</Subtitle>
      </Card>
    </Marker>
  );
}
