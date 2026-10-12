import Constants from 'expo-constants';
import {id} from "@expo/ui/swift-ui/modifiers";

export const isExpoGo = Constants.executionEnvironment === 'expo';

let cachedModule: any = null;
function getNotifications() {
    if (isExpoGo) return null;
    if (!cachedModule) {
        cachedModule = require('expo-notifications');
    }
    return cachedModule;
}

export const TriggerType = {
    DAILY: 'daily',
    TIME_INTERVAL: 'timeInterval',
} as const;

export type NotificationRequest = {
    content: {
        title: string;
        body: string;
        data?: Record<string, unknown>;
    }
    trigger: {
        type: string;
        seconds?: number;
        hour?: number;
        minute?: number;
        repeats?: number;
    };
};

export type NotificationResponse = {
    notification: {
        request: {
            content: {
                data?: Record<string, unknown>;
            };
        };
    };
};

export function setNotificationHandlerSafe(): void {
    const Notifications = getNotifications();
    if (!Notifications) return;
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true
        }),
    });
}

export async function requestNotificationPermissionSafe(): Promise<boolean> {
    const Notifications = getNotifications();
    if (!Notifications) {
        console.warn(
            'Skipping notification permission request - expo-notifications is not supported in Expo Go on SDK 53+. Use a development build to test reminders.'
        );
        return false;
    }
    const { status } = await Notifications.requestPermissionSafe();
    return status === 'granted';
}

export async function scheduleNotificationSafe(request: NotificationRequest): Promise<string> {
    const Notifications = getNotifications();
    if (!Notifications) return '';
    return Notifications.scheduleNotificationAsync(request);
}

export async function cancelScheduleNotificationSafe(
    id: string | null | undefined
): Promise<void> {
    const Notifications = getNotifications();
    if (!Notifications || !id) return;
    await Notifications.cancelScheduledNotificationAsync(id);
}

export function addNotificationResponseListenerSafe(
    listener: (response: NotificationResponse) => void
) : { remove: () => void} {
    const Notifications = getNotifications();
    if (!Notifications) {
        return { remove: () => {} };
    }
    return Notifications.addNotificationResponseReceivedListener(listener);
}