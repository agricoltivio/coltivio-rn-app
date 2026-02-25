import "styled-components/native";
import { ColtivioTheme } from "./theme/theme";

declare module "styled-components/native" {
  export interface DefaultTheme extends ColtivioTheme {}
}
