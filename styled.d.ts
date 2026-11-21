import "styled-components/native";
import { ColtivioTheme } from "./theme/theme";

declare module "styled-components/native" {
  // Declaration merging types the styled-components theme, the empty body is intended
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ColtivioTheme {}
}
