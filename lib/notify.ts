// Real system notifications (tray, sound) for the participant's notes, through expo-notifications (features.md C3).
// These are LOCAL notifications: the app raises one when it sees a new note, so they arrive while the app is open or was
// recently in the background. Reaching a closed app needs remote push and installed builds (features.md I, row 7).
// On the web there is no system notification; the note card on Home is the only signal there.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Notice } from './types';

const native = Platform.OS !== 'web';

if (native) {
  // Show the notification even while the app is in front, which is how the demo is run.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

let permission: Promise<boolean> | null = null;
const allowed = () =>
  (permission ??= (async () => {
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'Notes for you', importance: Notifications.AndroidImportance.HIGH });
    const now = await Notifications.getPermissionsAsync();
    if (now.granted) return true;
    if (!now.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  })().catch(() => false));

// The text is the note's own text, which already went through the banned-phrase filter on the server.
export async function showSystemNotification(note: Notice) {
  if (!native || !(await allowed())) return;
  await Notifications.scheduleNotificationAsync({ content: { title: 'A note for you', body: note.text, data: { noteId: note.id } }, trigger: null }).catch(() => {});
}

// Runs `fn` when the participant taps a notification. Returns the function that stops listening.
export function onNotificationTap(fn: () => void): () => void {
  if (!native) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener(() => fn());
  return () => sub.remove();
}
