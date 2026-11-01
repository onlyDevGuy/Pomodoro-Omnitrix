export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  notificationsSupported() ? Notification.permission : 'unsupported';

/** Ask once, from a user gesture. Browsers ignore or penalise requests made on page load. */
export async function askForNotifications() {
  if (!notificationsSupported() || Notification.permission !== 'default') return notificationPermission();
  return Notification.requestPermission();
}

/** Only shows when the app is in the background; on screen, the dial already says it. */
export async function notify(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted' || !document.hidden) return;
  const options: NotificationOptions = { body, icon: '/pwa-192x192.png', badge: '/pwa-64x64.png', tag: 'omnitrix' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  } catch {
    // Some mobile browsers only allow service-worker notifications; nothing else to try.
  }
}
