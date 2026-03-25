import { supabase } from "@/supabase/supabase";
import { Linking } from "react-native";
import { createAuthClient } from "@/api/api";
import { membershipApi } from "@/api/membership.api";

const appUrl = __DEV__ ? "http://localhost:4000" : "https://app.coltivio.ch";
const marketingUrl = __DEV__ ? "http://localhost:4321" : "https://coltivio.ch";

async function getHandoffToken(): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return null;
  const api = membershipApi(createAuthClient(accessToken));
  return api.createHandoffToken();
}

export async function openManageMembershipUrl() {
  const token = await getHandoffToken();
  const url = token
    ? `${appUrl}/auth/token#token=${token}&redirect=/membership`
    : `${appUrl}/membership`;
  Linking.openURL(url);
}

export async function openMembershipUrl() {
  const token = await getHandoffToken();
  const url = token ? `${marketingUrl}#token=${token}` : marketingUrl;
  Linking.openURL(url);
}
