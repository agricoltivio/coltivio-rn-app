import { Card } from "@/components/card/Card";
import { Subtitle } from "@/theme/Typography";
import { Marker } from "react-native-maps";
import { useTheme } from "styled-components/native";

export type LabelMarkerProps = {
  longitude: number;
  latitude: number;
  text: string;
};

export function LabelMarker({ latitude, longitude, text }: LabelMarkerProps) {
  const theme = useTheme();
  return (
    <Marker
      coordinate={{
        longitude,
        latitude,
      }}
    >
      <Card
        style={{
          padding: theme.spacing.s,
        }}
      >
        <Subtitle style={{ fontSize: 14 }}>{text}</Subtitle>
      </Card>
    </Marker>
  );
}
