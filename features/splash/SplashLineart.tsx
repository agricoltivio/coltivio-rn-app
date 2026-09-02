import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// The accent graphic from the brand kit (assets/lineart.svg): six overlapping
// arcs reading as flow, meadow, fields, terrain. The paths run far past the
// viewBox on purpose, the source clips them, so the wrapper hides the overflow
// instead of reproducing the clipPath.
const ARCS = [
  {
    stroke: "#2a5159",
    width: 1,
    d: "M-173.14,848.67c0-268.82,356.03-486.74,795.2-486.74s795.2,217.92,795.2,486.74S492.39,389.97,53.21,389.97s-226.34,727.51-226.34,458.69Z",
  },
  {
    stroke: "#3c6b67",
    width: 1.2,
    d: "M-92.62,824.03c0-255.21,338-510.17,754.94-510.17s754.94,254.96,754.94,510.17S687.28,391.18,270.33,391.18-92.62,1079.23-92.62,824.03Z",
  },
  {
    stroke: "#4d8674",
    width: 1.4,
    d: "M-12.09,799.38c0-241.6,319.97-533.6,714.68-533.6s714.68,292,714.68,533.6S882.17,392.38,487.46,392.38-12.09,1040.98-12.09,799.38Z",
  },
  {
    stroke: "#5fa082",
    width: 1.6,
    d: "M68.43,774.74c0-227.99,301.95-557.03,674.42-557.03s674.42,329.04,674.42,557.03-340.21-381.16-712.68-381.16S68.43,1002.73,68.43,774.74Z",
  },
  {
    stroke: "#70bb8f",
    width: 1.8,
    d: "M148.95,750.1c0-214.38,283.92-580.46,634.16-580.46s634.16,366.08,634.16,580.46-145.31-355.31-495.55-355.31S148.95,964.47,148.95,750.1Z",
  },
  {
    stroke: "#82d59d",
    width: 2,
    d: "M229.47,725.45c0-200.77,265.9-603.88,593.9-603.88s593.9,403.12,593.9,603.88,49.58-329.47-278.42-329.47S229.47,926.22,229.47,725.45Z",
  },
];

const VIEWBOX_WIDTH = 1320;
const VIEWBOX_HEIGHT = 572.77;

export const LINEART_ASPECT_RATIO = VIEWBOX_WIDTH / VIEWBOX_HEIGHT;

export function SplashLineart() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        {ARCS.map((arc) => (
          <Path
            key={arc.stroke}
            d={arc.d}
            fill="none"
            stroke={arc.stroke}
            strokeWidth={arc.width}
            strokeMiterlimit={10}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: LINEART_ASPECT_RATIO,
    overflow: "hidden",
  },
});
