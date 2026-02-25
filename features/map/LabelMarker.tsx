import { Card } from "@/components/card/Card";
import { Subtitle } from "@/theme/Typography";
import { Platform } from "react-native";
import { Marker } from "react-native-maps";
import { useTheme } from "styled-components/native";

export type LabelMarkerProps = {
  longitude: number;
  latitude: number;
  text: string;
  hidden?: boolean;
};

export function LabelMarker({
  latitude,
  longitude,
  text,
  hidden,
}: LabelMarkerProps) {
  const theme = useTheme();
  return (
    <Marker
      coordinate={{
        longitude,
        latitude,
      }}
      tracksViewChanges={true}
      zIndex={100}
      tappable={false}
    >
      <Card
        style={{
          padding: theme.spacing.xxs,
          // display: hidden ? "none" : "flex",
          opacity: hidden ? 0 : 1,
        }}
      >
        <Subtitle style={{ fontSize: 13 }}>{text}</Subtitle>
      </Card>
    </Marker>
  );
}
