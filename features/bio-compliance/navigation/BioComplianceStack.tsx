import { Stack } from "@/navigation/stack";
import { BioComplianceScreen } from "../BioComplianceScreen";

export function renderBioComplianceStack() {
  return (
    <Stack.Screen
      key="bio-compliance"
      name="BioCompliance"
      options={{ title: "" }}
      component={BioComplianceScreen}
    />
  );
}
