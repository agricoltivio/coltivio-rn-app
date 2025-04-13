import React, { useContext, useEffect } from "react";
import { MapOverlayContext } from "./MapOverlayProvider";

interface MapOverlayProps {
  children: React.ReactNode;
  name: string;
}
export const MapOverlay: React.FC<MapOverlayProps> = ({ children, name }) => {
  const { addElement, removeElement } = useContext(MapOverlayContext);
  useEffect(() => {
    console.log("add");
    addElement({ name, component: children });
    return () => {
      console.log("remove");
      removeElement(name);
    };
  }, []);

  return null;
};
