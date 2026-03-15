import { supabase } from "@/supabase/supabase";
import { Linking } from "react-native";

export async function openManageMembershipUrl() {
  const baseUrl = __DEV__ ? "http://localhost:4000" : "https://app.coltivio.ch";
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (session) {
    const url = `${baseUrl}/auth/token?access_token=${session.access_token}&refresh_token=${session.refresh_token}&redirect=/membership`;
    Linking.openURL(url);
  } else {
    Linking.openURL(`${baseUrl}/membership`);
  }
}

export async function openMembershipUrl() {
  const baseUrl = __DEV__ ? "http://localhost:4321" : "https://coltivio.ch";
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (session) {
    const url = `${baseUrl}#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
    Linking.openURL(url);
  } else {
    Linking.openURL(baseUrl);
  }

  // Direct link to the webapp membership page — re-enable if app store allows:
  // const appBaseUrl = __DEV__ ? "http://localhost:4000" : "https://app.coltivio.ch";
  // if (session) {
  //   const url = `${appBaseUrl}/auth/token?access_token=${session.access_token}&refresh_token=${session.refresh_token}&redirect=/membership`;
  //   Linking.openURL(url);
  // } else {
  //   Linking.openURL(`${appBaseUrl}/membership`);
  // }
}
