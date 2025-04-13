import React, { useContext, useEffect } from "react";
import { MapOverlayContext } from "./MapOverlayProvider";

interface MapControlOverlayProps {
  children: React.ReactNode;
  name: string;
}
export const MapControlOverlay: React.FC<MapControlOverlayProps> = ({
  children,
  name,
}) => {
  const { addMapControl, removeMapControl } = useContext(MapOverlayContext);
  useEffect(() => {
    addMapControl({ name, component: children });
    return () => {
      removeMapControl(name);
    };
  }, [children, name]);

  return null;
};
