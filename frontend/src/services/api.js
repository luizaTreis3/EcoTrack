import { Platform } from "react-native";
import Constants from "expo-constants";

const urlConfigurada = process.env.EXPO_PUBLIC_API_URL;
const hostExpo = Constants.expoConfig?.hostUri?.split(":")[0];
const hostBackend = hostExpo || "172.20.91.38";

export const API_URL = (
  urlConfigurada
  || (Platform.OS === "web"
    ? "http://localhost:3000"
    : `http://${hostBackend}:3000`)
).replace(/\/+$/, "");
