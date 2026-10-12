import 'react-native-get-random-values';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    scheduleNotificationSafe,
    cancelScheduleNotificationSafe,
    TriggerType,
} from '../utils/notification';
import { DraftTime } from '../hooks/useMedicationForm';
import {
    Medication,
    MedicationTime,
    deleteMedication,
    getAllStatuses,
    getMedications,
    saveMedication,
    updateMedication,
} from '../storage/medicationStorage';

export type MedicationFormValues = {
    name: string;
    times: DraftTime[];
    foodTiming: string;
    quantityType: string;
    quantity: number;
    notes?: string;
};

export type DoseStatus = 'not yet' | 'taken' | 'not taken';

export type MedicationWithStatus = Medication & { statusByTime: Record<string, DoseStatus> };

export function useMedications() {
    const [medications, setMedications] = useState<MedicationWithStatus[]>([]);

    const fetchMedications = useCallback(async () => {
        try {
            const rawMeds = await getMedications();
            const meds = Array.isArray(rawMeds) ? rawMeds : [];
            const statuses = await getAllStatuses() || [];
            const today = new Date().toISOString().split('T')[0];

            const merged = meds.filter(Boolean).map((med) => {
                const safeTimes = Array.isArray(med?.times) ? med.times : [];

                return {
                    ...med,
                    statusByTime: Object.fromEntries(
                        safeTimes.map((t) => {
                            const status = statuses.find(
                                (s) => s?.medicationId === med?.id &&
                                    s?.date === today &&
                                    s?.hour === t?.hour &&
                                    s?.minute === t?.minute
                            );
                            return [`${t.hour}:${t.minute}`, status ? status.status : ('not yet' as const)];
                        })
                    ),
                };
            });

            setMedications(merged);
        } catch (error) {
            console.error('Error fetching medications:', error);
        }
    }, []);

    useEffect(() => {
        fetchMedications();
    }, [fetchMedications]);

    const scheduleTimes = useCallback(
        async (medicationId: string, name: string, foodTiming: string, times: DraftTime[]): Promise<MedicationTime[]> => {
            const scheduled: MedicationTime[] = [];
            for (const t of times) {
                const notificationId = await scheduleNotificationSafe({
                    content: {
                        title: 'Medication Reminder',
                        body: `It's time to take your ${name} (${foodTiming})`,
                        data: { medicationId, hour: t.hour, minute: t.minute },
                    },
                    trigger: {
                        type: TriggerType.DAILY,
                        hour: t.hour,
                        minute: t.minute,
                    },
                });
                scheduled.push({ hour: t.hour, minute: t.minute, notificationId });
            }
            return scheduled;
        },
        []
    );

    const addMedication = useCallback(
        async (values: MedicationFormValues) => {
            const id = uuidv4();
            const times = await scheduleTimes(id, values.name, values.foodTiming, values.times);

            const newMed: Medication = {
                id,
                name: values.name,
                times,
                foodTiming: values.foodTiming,
                quantityType: values.quantityType,
                quantity: values.quantity,
                notes: values.notes,
            };
            await saveMedication(newMed);
            await fetchMedications();
            return newMed;
        },
        [fetchMedications, scheduleTimes]
    );

    const editMedication = useCallback(
        async (id: string, values: MedicationFormValues) => {
            const rawMeds = await getMedications();
            const meds = Array.isArray(rawMeds) ? rawMeds : [];
            const oldMed = meds.filter(Boolean).find((m) => m?.id === id);

            if (oldMed) {
                const safeTimes = Array.isArray(oldMed.times) ? oldMed.times : [];
                for (const t of safeTimes) {
                    if (t?.notificationId) {
                        await cancelScheduleNotificationSafe(t.notificationId);
                    }
                }
            }

            const times = await scheduleTimes(id, values.name, values.foodTiming, values.times);

            const updatedMed: Medication = {
                id,
                name: values.name,
                times,
                foodTiming: values.foodTiming,
                quantityType: values.quantityType,
                quantity: values.quantity,
                notes: values.notes,
            };
            await updateMedication(updatedMed);
            await fetchMedications();
            return updatedMed;
        },
        [fetchMedications, scheduleTimes]
    );

    const removeMedication = useCallback(
        async (id: string) => {
            const rawMeds = await getMedications();
            const meds = Array.isArray(rawMeds) ? rawMeds : [];

            const medToDelete = meds.filter(Boolean).find((m) => m?.id === id);
            if (!medToDelete) return null;

            const safeTimes = Array.isArray(medToDelete.times) ? medToDelete.times : [];
            for (const t of safeTimes) {
                if (t?.notificationId) {
                    await cancelScheduleNotificationSafe(t.notificationId);
                }
            }

            await deleteMedication(id);
            await fetchMedications();
            return medToDelete;
        },
        [fetchMedications]
    );

    return { medications, fetchMedications, addMedication, editMedication, removeMedication };
}