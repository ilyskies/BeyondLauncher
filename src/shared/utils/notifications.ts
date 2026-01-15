import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

let permissionGranted: boolean | null = null;

async function ensurePermission(): Promise<boolean> {
  if (permissionGranted !== null) {
    return permissionGranted;
  }

  permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }

  return permissionGranted;
}

export async function showNativeNotification(
  title: string,
  body: string
): Promise<boolean> {
  try {
    const granted = await ensurePermission();

    if (granted) {
      await sendNotification({ title, body });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to show native notification:", error);
    return false;
  }
}

