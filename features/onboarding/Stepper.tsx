import { View } from "react-native";
import { ThemeConsumer } from "styled-components";
import { useTheme } from "styled-components/native";

function Step({ active }: { active: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderRadius: 20,
        borderColor: theme.colors.primary,
        borderWidth: 1,
        backgroundColor: active ? theme.colors.primary : "transparent",
        height: 20,
        width: 20,
      }}
    />
  );
}

export function Stepper({
  totalSteps,
  currentStep,
}: {
  totalSteps: number;
  currentStep: number;
}) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", paddingBottom: theme.spacing.m }}>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
        }}
      >
        {[...Array(totalSteps).keys()].map((_, index) => (
          <Step key={index} active={index + 1 === currentStep} />
        ))}
      </View>
    </View>
  );
}
