import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'medications';
const STATUS_KEY = 'medication_status';

export type MedicationTime = {
    hour: number;
    minute: number;
    notificationId: string;
}

export type Medication = {
    id: string; // local id or server scheduleId when synced
    scheduleId?: string | null; // server-side schedule id (GUID) when synced
    name: string;
    times: MedicationTime[];
    foodTiming: string;
    quantityType: string;
    quantity: number;
    notes?: string;
}

export type MedicationStatus = {
    medicationId: string;
    date: string;
    hour: number;
    minute: number;
    status: 'not yet' | 'taken' | 'not taken'; // Fixed leading space typo
}

// Medication CRUD
export const saveMedication = async (med: Medication) => {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const rawMeds = existing ? JSON.parse(existing) : [];
    const meds: Medication[] = Array.isArray(rawMeds) ? rawMeds.filter(Boolean) : [];
    meds.push(med);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
};

export const getMedications = async (): Promise<Medication[]> => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const rawMeds = data ? JSON.parse(data) : [];
    return Array.isArray(rawMeds) ? rawMeds.filter(Boolean) : [];
};

export const updateMedication = async (updateMed: Medication) => {
    const meds = await getMedications();
    const updated = meds.map((med) => (med.id === updateMed.id ? updateMed : med));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteMedication = async (id: string) => {
    const meds = await getMedications();
    const filtered = meds.filter((med) => med?.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    const statuses = await getAllStatuses();
    // Fixed logic: remove only the statuses belonging to the deleted medication
    const updatedStatuses = statuses.filter((s) => s?.medicationId !== id);
    await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(updatedStatuses));
};

export const clearMedications = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(STATUS_KEY);
};

// Medication Status CRUD
export const saveStatus = async (status: MedicationStatus) => {
    const existing = await AsyncStorage.getItem(STATUS_KEY);
    const rawStatuses = existing ? JSON.parse(existing) : [];
    const statuses: MedicationStatus[] = Array.isArray(rawStatuses) ? rawStatuses.filter(Boolean) : [];

    const filtered = statuses.filter(
        (s) =>
            !(
                s?.medicationId === status.medicationId &&
                s?.date === status.date &&
                s?.hour === status.hour &&
                s?.minute === status.minute
            )
    );

    filtered.push(status);
    await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(filtered));
};

export const getAllStatuses = async (): Promise<MedicationStatus[]> => {
    const existing = await AsyncStorage.getItem(STATUS_KEY);
    const rawStatuses = existing ? JSON.parse(existing) : [];
    return Array.isArray(rawStatuses) ? rawStatuses.filter(Boolean) : [];
};

const HISTORY_RETENTION_DAYS = 90;

export const resetStatusesForNewDay = async () => {
    const meds = await getMedications();
    const today = new Date().toISOString().split('T')[0];

    const statuses = await getAllStatuses();
    const missingToday: MedicationStatus[] = [];

    meds.forEach((med) => {
        const safeTimes = Array.isArray(med?.times) ? med.times : [];
        safeTimes.forEach((t) => {
            const exists = statuses.some(
                (s) => s?.medicationId === med?.id && s?.date === today && s?.hour === t?.hour && s?.minute === t?.minute
            );
            if (!exists) {
                missingToday.push({ medicationId: med.id, date: today, hour: t.hour, minute: t.minute, status: 'not yet' });
            }
        });
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - HISTORY_RETENTION_DAYS); // Fixed date subtraction syntax
    const cutoffKey = cutoff.toISOString().split('T')[0];
    const trimmed = statuses.filter((s) => s?.date >= cutoffKey);

    if (missingToday.length > 0 || trimmed.length !== statuses.length) {
        await AsyncStorage.setItem(STATUS_KEY, JSON.stringify([...trimmed, ...missingToday]));
    }
};