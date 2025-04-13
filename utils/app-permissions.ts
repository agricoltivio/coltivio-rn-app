import * as Location from "expo-location";

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error while requesting location permission:", error);
    return false;
  }
};
