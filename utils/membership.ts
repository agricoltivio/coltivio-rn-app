import { Linking } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/rootStackTypes";

const marketingUrl = __DEV__ ? "http://localhost:4321" : "https://coltivio.ch";

// Single choke point for every "become a member" / membership-promotion surface in the app.
// If the app model ever changes (e.g. the app becomes gated), flip this to false to pull
// every membership CTA at once instead of hunting through each screen.
export const canLinkToMembership = true;

export function openMoreInfoUrl() {
  Linking.openURL(marketingUrl);
}

// Navigating to the membership screen from a promotional surface (AgriColtivio info screen,
// home promo popup) shouldn't leave that surface on the back stack — pressing back from the
// membership screen should behave the same as reaching it the normal way (Home -> Account),
// not return to the promo. Resets the stack instead of pushing onto it.
export function goToMembershipScreen(
  navigation: Omit<NativeStackNavigationProp<RootStackParamList>, "setParams">,
  autoOpenStatuten?: boolean,
) {
  navigation.reset({
    index: 2,
    routes: [
      { name: "Home" },
      { name: "UserAccount" },
      { name: "UserMembership", params: { autoOpenStatuten } },
    ],
  });
}
