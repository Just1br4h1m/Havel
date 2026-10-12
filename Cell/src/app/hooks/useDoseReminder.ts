import { useEffect, useState } from 'react';
import { Medication, saveStatus } from '../storage/medicationStorage';
import {
    addNotificationResponseListenerSafe,
    scheduleNotificationSafe,
    TriggerType
} from '../utils/notification';
import { formatTime } from '../utils/time';

export function useDoseReminder(medications: Medication[], onStatusRecorded: () => void) {
    const [visible, setVisible] = useState<boolean>(false);
    const [activeMedicationId, setActiveMedicationId] = useState<string | null>(null);
    const [activeTime, setActiveTime] = useState<{ hour: number; minute: number} | null>(null);
    const [showSnoozeOptions, setShowSnoozeOptions] = useState<boolean>(false);

    useEffect(() => {
        const subscription = addNotificationResponseListenerSafe((response) => {
            const data = response?.notification?.request?.content?.data as
                | { medicationId?: string; hour?: number; minute?: number }
                | undefined;
            setActiveMedicationId(data?.medicationId ?? null);
            setActiveTime(
                typeof data?.hour === 'number' && typeof data?.minute === 'number'
                    ? { hour: data.hour, minute: data.minute }
                    : null
            );
            setShowSnoozeOptions(false);
            setVisible(true);
        });

        return () => {
            // Safely check if subscription and .remove exist before calling
            if (subscription && typeof subscription.remove === 'function') {
                subscription.remove();
            } else if (subscription && typeof (subscription as any).removeSubscription === 'function') {
                (subscription as any).removeSubscription();
            }
        };
    }, []);

    const activeMedication = medications.find((med) => med.id === activeMedicationId) ?? null;
    const activeMedicationName = activeMedication?.name ?? 'this medication';
    const activeTimeLabel = activeTime ? formatTime(activeTime.hour, activeTime.minute) : null;

    const recordStatus = async (status: 'taken' | 'not taken') => {
        if (activeMedicationId && activeTime) {
            const today = new Date().toISOString().split('T')[0];
            await saveStatus({
                medicationId: activeMedicationId,
                date: today,
                hour: activeTime.hour,
                minute: activeTime.minute,
                status,
            });
            onStatusRecorded();
        }
        setVisible(false);
    };

    const openSnoozeOptions = () => setShowSnoozeOptions(true);

    const snooze = async (minutes: number) => {
        if (activeMedicationId && activeTime) {
            await scheduleNotificationSafe({
                content: {
                    title: 'Medication Reminder',
                    body: `Reminder after snooze: It's time to take your ${activeMedicationName}.`,
                    data: { medicationId: activeMedicationId, hour: activeTime.hour, minute: activeTime.minute }
                },
                trigger: {
                    type: TriggerType.TIME_INTERVAL,
                    seconds: minutes * 60, // Fixed multiplication operator
                    repeats: false
                },
            });
        }
        setShowSnoozeOptions(false);
        setVisible(false);
    };

    return {
        visible,
        activeMedicationName,
        activeTimeLabel,
        showSnoozeOptions,
        openSnoozeOptions,
        recordStatus,
        snooze,
        close: () => setVisible(false),
    };
}