import "styled-components/native";
import { ColtivioTheme } from "./theme/theme";

declare module "styled-components/native" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- styled-components' documented theme-typing pattern; requires an interface (not a type alias) for declaration merging
  export interface DefaultTheme extends ColtivioTheme {}
}
