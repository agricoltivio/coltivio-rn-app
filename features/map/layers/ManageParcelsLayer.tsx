import { BoundingBox } from "@/utils/geo-spatials";
import { ParcelLayer } from "./ParcelLayer";
import { MapControlOverlay } from "../overlays/MapControlOverlay";
import { SquareCta } from "@/components/buttons/SquareCta";
import { SquareIconCta } from "@/components/buttons/SquareIconCta";
import { useState } from "react";
import { View, Text } from "react-native";
type ManageParcelsLayerProps = {
  viewportBbox: BoundingBox;
  currentParcelIds: string[];
};
export function ManageParcelsLayer({ viewportBbox }: ManageParcelsLayerProps) {
  const [selectdParcels, setSelectedParcels] = useState<string[]>([]);

  function handleParcelSelected(id: string) {
    setSelectedParcels((prev) => [...prev, id]);
  }
  return (
    <>
      <ParcelLayer
        viewportBbox={viewportBbox}
        selectedParcels={selectdParcels}
        onParcelSelected={handleParcelSelected}
      />
      <MapControlOverlay name={"map-controls"}>
        <View
          style={{
            backgroundColor: "white",
            height: 40,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text>selected: {selectdParcels.length}</Text>
        </View>
        <SquareIconCta
          onPress={() => {}}
          icon="save-outline"
          disabled={selectdParcels.length === 0}
        />
      </MapControlOverlay>
    </>
  );
  //   return (
  //     <>
  //       {/* <MapControlOverlay name={"map-controls"}>
  //         <SquareIconCta onPress={() => {}} icon="create-outline" />
  //         <SquareIconCta onPress={() => {}} icon="save-outline" />
  //         <SquareIconCta onPress={() => {}} icon="trash-outline" />
  //       </MapControlOverlay> */}
  //       <ParcelLayer viewportBbox={viewportBbox} />;
  //     </>
  //   );
}
