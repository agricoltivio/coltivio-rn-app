import { Linking } from "react-native";

const marketingUrl = __DEV__ ? "http://localhost:4321" : "https://coltivio.ch";

// Single choke point for every "become a member" / membership-promotion surface in the app.
// If the app model ever changes (e.g. the app becomes gated), flip this to false to pull
// every membership CTA at once instead of hunting through each screen.
export const canLinkToMembership = true;

export function openMoreInfoUrl() {
  Linking.openURL(marketingUrl);
}
