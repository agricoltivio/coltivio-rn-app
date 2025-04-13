import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export function useSetTitle(title: string = "") {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ title });
  }, [title]);
}
