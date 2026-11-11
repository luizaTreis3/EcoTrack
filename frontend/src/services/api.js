import { Platform } from "react-native";

const IP_DO_COMPUTADOR = "192.168.1.21";

export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : `http://${IP_DO_COMPUTADOR}:3000`;
