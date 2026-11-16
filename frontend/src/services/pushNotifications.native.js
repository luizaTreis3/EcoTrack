import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { API_URL } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(idUsuario) {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId
    || Constants.easConfig?.projectId;

  if (!projectId) {
    return { status: "eas-not-configured" };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "EcoTrack",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#22c55e",
    });
  }

  const permissaoAtual = await Notifications.getPermissionsAsync();
  let status = permissaoAtual.status;

  if (status !== "granted") {
    const permissaoSolicitada = await Notifications.requestPermissionsAsync();
    status = permissaoSolicitada.status;
  }

  if (status !== "granted") {
    return { status: "permission-denied" };
  }

  const expoPushToken = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  const response = await fetch(
    `${API_URL}/usuarios/${encodeURIComponent(idUsuario)}/push-token`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expo_push_token: expoPushToken,
        plataforma: Platform.OS,
      }),
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || "Não foi possível registrar este dispositivo.");
  }

  return { status: "registered" };
}

export function observePushNotification(onOpenNotifications) {
  const abrirCentral = (response) => {
    if (response.notification.request.content.data?.screen === "Notificacoes") {
      onOpenNotifications();
    }
  };

  const respostaInicial = Notifications.getLastNotificationResponse();
  if (respostaInicial) {
    abrirCentral(respostaInicial);
  }

  const subscription = Notifications.addNotificationResponseReceivedListener(abrirCentral);
  return () => subscription.remove();
}
