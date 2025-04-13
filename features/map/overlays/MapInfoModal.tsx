import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { Subtitle, Title } from "@/theme/Typography";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type MapInfoModalProps = {
  title: string;
  text: string;
};

export function MapInfoModal({ title, text }: MapInfoModalProps) {
  const theme = useTheme();
  const frame = useSafeAreaFrame();

  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  function onDone() {
    setVisible(false);
  }
  return (
    <Card
      style={{
        position: "absolute",
        top: frame.height / 2 - 100,
        left: theme.spacing.m,
        right: theme.spacing.m,
      }}
    >
      <Title>{title}</Title>
      <View style={{ marginTop: theme.spacing.m }}>
        <Subtitle>{text}</Subtitle>
      </View>
      <View style={{ marginTop: theme.spacing.l }}>
        <Button fontSize={16} title="Ok" onPress={onDone} />
      </View>
    </Card>
  );
}
