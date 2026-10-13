import 'react-native-get-random-values';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    scheduleNotificationSafe,
    cancelScheduleNotificationSafe,
    TriggerType,
} from '../utils/notification';
import { DraftTime } from '../hooks/useMedicationForm';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
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
            // Attempt to fetch from backend when authenticated, otherwise use local storage
            const token = await SecureStore.getItemAsync('authToken');

            let medsFromServer: Medication[] | null = null;

            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                    const res = await api.get('/schedule/get-schedule', {
                        headers: { 'Content-Type': 'application/json', userId: `${userId}` },
                    });

                    if (res?.data) {
                        const agg = res.data;

                        const mapDetailsToMed = (d: any) => {
                            const timesArray: MedicationTime[] = Array.isArray(d?.doseTimes)
                                ? d.doseTimes.map((t: string) => {
                                      // expect t like "HH:mm:ss" or "HH:mm"
                                      const parts = t.split(':').map((p: string) => parseInt(p, 10));
                                      const hour = parts[0] ?? 0;
                                      const minute = parts[1] ?? 0;
                                      return { hour, minute, notificationId: '' } as MedicationTime;
                                  })
                                : [];

                            const foodTimingMapBack = (ft: string) => {
                                if (ft?.toLowerCase()?.includes('before')) return 'Before Food';
                                if (ft?.toLowerCase()?.includes('after')) return 'After Food';
                                return 'During Food';
                            };

                            const isPill = !!d?.isPill;
                            const quantity = isPill ? (d?.quantityAmountPills ?? 0) : (d?.quantityAmountSyrups ?? 0);
                            const quantityType = isPill ? 'Pills' : 'Syrup';

                            return {
                                id: d?.scheduleId ?? uuidv4(),
                                scheduleId: d?.scheduleId ?? null,
                                name: d?.medicationName ?? d?.medicationDescription ?? 'Medication',
                                times: timesArray,
                                foodTiming: foodTimingMapBack(d?.foodTiming),
                                quantityType,
                                quantity,
                                notes: d?.notes ?? undefined,
                            } as Medication;
                        };

                        const combined: Medication[] = [
                            ...(Array.isArray(agg?.morningMedications) ? agg.morningMedications.map(mapDetailsToMed) : []),
                            ...(Array.isArray(agg?.afternoonMedications) ? agg.afternoonMedications.map(mapDetailsToMed) : []),
                            ...(Array.isArray(agg?.eveningMedications) ? agg.eveningMedications.map(mapDetailsToMed) : []),
                        ];

                        // remove duplicates by scheduleId
                        const byId: Record<string, Medication> = {};
                        for (const m of combined) {
                            if (m.scheduleId) byId[m.scheduleId] = m;
                            else byId[m.id] = m;
                        }

                        medsFromServer = Object.values(byId);

                        // persist to local storage so statuses and notifications can be managed locally
                        const { clearMedications, saveMedication } = await import('../storage/medicationStorage');
                        await clearMedications();
                        for (const m of medsFromServer) {
                            await saveMedication(m);
                        }
                    }
                } catch (serverErr) {
                    console.warn('Failed to fetch meds from server, falling back to local:', serverErr);
                }
            }

            const rawMeds = medsFromServer ?? (await getMedications());
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
            // If authenticated, create schedule on server first, otherwise fallback to local-only
            const token = await SecureStore.getItemAsync('authToken');
            let id = uuidv4();
            let scheduleId: string | null = null;

            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                    // Map to backend CreateScheduleDto
                    const mapFoodTiming = (ft: string) => {
                        if (ft === 'Before Food') return 0;
                        if (ft === 'After Food') return 2;
                        return 1;
                    };

                    const dto = {
                        medicationName: values.name,
                        medicationDescription: values.notes ?? null,
                        foodTiming: mapFoodTiming(values.foodTiming),
                        doseTimes: values.times.map((t) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:00`),
                        IsPill: values.quantityType === 'Pills',
                        isSyrup: values.quantityType === 'Syrup',
                        quantityAmountPills: values.quantityType === 'Pills' ? values.quantity : 0,
                        quantityAmountSyrups: values.quantityType === 'Syrup' ? values.quantity : 0,
                        notes: values.notes ?? null,
                    };

                    const res = await api.post('/schedule/schedule-medication', dto, {
                        headers: { 'Content-Type': 'application/json', userId: `${userId}` },
                    });

                    if (res?.data) {
                        const details = res.data;
                        scheduleId = details.scheduleId;
                        id = scheduleId; // use server guid as local id
                    }
                } catch (err) {
                    console.warn('Failed to create schedule on server, falling back to local-only', err);
                }
            }

            // schedule local notifications and save locally
            const times = await scheduleTimes(id, values.name, values.foodTiming, values.times);

            const newMed: Medication = {
                id,
                scheduleId: scheduleId ?? null,
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

            // If this medication is synced, update on server
            if (oldMed?.scheduleId) {
                try {
                    const token = await SecureStore.getItemAsync('authToken');
                    if (token) {
                        const decoded: any = jwtDecode(token);
                        const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                        const mapFoodTiming = (ft: string) => {
                            if (ft === 'Before Food') return 0;
                            if (ft === 'After Food') return 2;
                            return 1;
                        };

                        const dto = {
                            medicationName: values.name,
                            medicationDescription: values.notes ?? null,
                            foodTiming: mapFoodTiming(values.foodTiming),
                            doseTimes: values.times.map((t) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:00`),
                            IsPill: values.quantityType === 'Pills',
                            isSyrup: values.quantityType === 'Syrup',
                            quantityAmountPills: values.quantityType === 'Pills' ? values.quantity : 0,
                            quantityAmountSyrups: values.quantityType === 'Syrup' ? values.quantity : 0,
                            notes: values.notes ?? null,
                        };

                        await api.put('/schedule/update-schedule', dto, {
                            headers: { 'Content-Type': 'application/json', scheduleId: `${oldMed.scheduleId}` },
                        });
                    }
                } catch (err) {
                    console.warn('Failed to update schedule on server, continuing locally', err);
                }
            }

            const times = await scheduleTimes(id, values.name, values.foodTiming, values.times);

            const updatedMed: Medication = {
                id,
                scheduleId: oldMed?.scheduleId ?? null,
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

            // If synced, delete on server
            if (medToDelete?.scheduleId) {
                try {
                    const token = await SecureStore.getItemAsync('authToken');
                    if (token) {
                        await api.delete('/schedule/remove-schedule-medication', {
                            headers: { scheduleId: `${medToDelete.scheduleId}` },
                        });
                    }
                } catch (err) {
                    console.warn('Failed to delete schedule on server, continuing to remove locally', err);
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