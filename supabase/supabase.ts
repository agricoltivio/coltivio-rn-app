import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_API_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const localUrl = `http://${Constants.expoConfig?.hostUri?.split(":").shift()?.concat(":54321")}`;
const baseUrl = supabaseUrl ?? localUrl;

export const supabase = createClient(baseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
