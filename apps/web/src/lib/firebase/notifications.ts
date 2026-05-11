import { getToken } from "firebase/messaging";

import { initMessaging } from "@/lib/firebase/client";

export async function requestPushToken(vapidKey: string): Promise<string | null> {
  const messaging = await initMessaging();
  if (!messaging) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  return getToken(messaging, { vapidKey });
}
