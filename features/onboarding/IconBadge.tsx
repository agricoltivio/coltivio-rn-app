import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

export function IconBadge({
  name,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View
      style={{
        alignSelf: "center",
        marginVertical: 24,
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#ddd",
        backgroundColor: "rgba(52, 52, 52, 0.08)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons name={name} size={36} color="black" />
    </View>
  );
}
