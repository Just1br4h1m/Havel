import { useCallback, useEffect, useState } from 'react';
import { getAllStatuses, MedicationStatus } from '../storage/medicationStorage';
import { calculateAdherencePercent, calculateStreak, getLastNDates } from '../utils/adherence';

export function useAdherence() {
    const [statuses, setStatuses] = useState<MedicationStatus[]>([]);
    
    const refresh = useCallback(async () => {
        const all = await getAllStatuses();
        setStatuses(all);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);
    
    const last7Days = getLastNDates(7);
    const streak = calculateStreak(statuses);
    const adherencePercent = calculateAdherencePercent(statuses, last7Days);
    
    return { statuses, streak, adherencePercent, last7Days, refresh };
}