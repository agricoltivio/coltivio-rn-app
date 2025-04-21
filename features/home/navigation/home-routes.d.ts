import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type HomeStackParamList = {
  Home: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "Home"
>;
