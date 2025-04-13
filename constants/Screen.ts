import { Dimensions } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";

const window = Dimensions.get("window");
const { height, width } = window;

export const deviceWidth = width;
export const deviceHeight = height;

export interface InsetsProps {
  insets: EdgeInsets;
}
