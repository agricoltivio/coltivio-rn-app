import React, { useState } from "react";
import { MapControls } from "./MapControls";
interface PortalProviderProps {
  children: React.ReactNode;
}

interface Element {
  name: string;
  component: React.ReactNode;
}
export const MapOverlayContext = React.createContext({
  addMapControl: (mapControl: Element) => {},
  removeMapControl: (name: string) => {},
  addElement: (element: Element) => {},
  removeElement: (name: string) => {},
});
export const MapOverlayProvider: React.FC<PortalProviderProps> = ({
  children,
}) => {
  const [mapControls, setMapControls] = useState<
    Record<string, React.ReactNode>
  >({});
  const [elements, setElements] = useState<Record<string, React.ReactNode>>({});
  const addMapControl = ({ name, component }: Element) => {
    setMapControls((prevComponents) => ({
      ...prevComponents,
      [name]: component,
    }));
  };
  const removeMapControl = (name: string) => {
    setMapControls((prevComponents) => {
      const newComponents = { ...prevComponents };
      delete newComponents[name];
      return newComponents;
    });
  };

  const addElement = ({ name, component }: Element) => {
    setElements((prevComponents) => ({
      ...prevComponents,
      [name]: component,
    }));
  };
  const removeElement = (name: string) => {
    setElements((prevComponents) => {
      const newComponents = { ...prevComponents };
      delete newComponents[name];
      return newComponents;
    });
  };
  return (
    <MapOverlayContext.Provider
      value={{
        addMapControl,
        removeMapControl,
        addElement,
        removeElement,
      }}
    >
      <React.Fragment>{children}</React.Fragment>
      <React.Fragment>
        {Object.keys(mapControls).length > 0 && (
          <MapControls>
            {Object.entries(mapControls).map(([name, Component]) => Component)}
          </MapControls>
        )}
        {Object.entries(elements).map(([name, Component]) => Component)}
      </React.Fragment>
    </MapOverlayContext.Provider>
  );
};
