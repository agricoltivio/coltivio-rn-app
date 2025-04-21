import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./rootStackTypes";

export const Stack = createNativeStackNavigator<RootStackParamList>();
