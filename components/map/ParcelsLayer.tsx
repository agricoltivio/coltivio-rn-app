import { Layer, RasterSource } from "@maplibre/maplibre-react-native";
import React from "react";
import { type BaseLayer } from "./MapLibreMap";

// Parcel borders (RESF) and numbers (OSNR) of the official survey, rendered by geodienste.ch as transparent PNGs.
// The WMS only draws them from a scale of 1:5000, so tiles are requested at 512 px: that halves the scale and the
// lines appear from zoom 16 (at 256 px only from zoom 17), and they are sharper on high-density screens.
const PARCELS_WMS_URL =
  "https://geodienste.ch/db/av_0/deu?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true" +
  "&LAYERS=RESF,OSNR&STYLES=&CRS=EPSG:3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}";
// Zoom 15 would need 1024 px tiles (~190 KB each)
const PARCELS_MIN_ZOOM = 16;

// Cadastral parcel borders, not interactive. The WMS draws black lines; on the satellite image
// they are brightened to white.
export function ParcelsLayer({ baseLayer }: { baseLayer: BaseLayer }) {
  return (
    <RasterSource
      id="cadastral-parcels"
      tiles={[PARCELS_WMS_URL]}
      tileSize={256}
      minzoom={PARCELS_MIN_ZOOM}
    >
      <Layer
        type="raster"
        id="cadastral-parcels-layer"
        minzoom={PARCELS_MIN_ZOOM}
        paint={{
          "raster-brightness-min": baseLayer === "satellite" ? 1 : 0,
        }}
      />
    </RasterSource>
  );
}
