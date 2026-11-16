import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleTestNotification() {
  let { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    ({ status } = await Notifications.requestPermissionsAsync());
  }

  if (status !== "granted") {
    throw new Error("Permissão para notificações não concedida.");
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Teste EcoTrack",
      body: "Notificação local recebida.",
    },
    trigger: null,
  });
}
