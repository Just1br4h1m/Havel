import { MedicationStatus } from '../storage/medicationStorage';

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getWeekdayLabel(dateKey: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    return WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
}

export function getLastNDates(n: number, from: Date = new Date()): string[] {
    const dates: string[] = [];
    for (let i = 0; i < n; i++) {
        const d = new Date(from);
        d.setDate(d .getDate() - i);
        dates.push(toDateKey(d));
    }
    return dates;
}

export type DaySummary = {
    date: string;
    taken: number;
    notTaken: number;
    pending: number;
    total: number;
}

export function summarizeDay(statuses: MedicationStatus[], date: string): DaySummary {
    const dayStatuses = statuses.filter((s) => s.date === date);
    return {
        date,
        taken: dayStatuses.filter((s) => s.status === 'taken').length,
        notTaken: dayStatuses.filter((s) => s.status === 'not taken').length,
        pending: dayStatuses.filter((s) => s.status === 'not yet').length,
        total: dayStatuses.length,
    };
}

export function calculateAdherencePercent(statuses: MedicationStatus[], days: string[]): number {
    let taken = 0;
    let resolved = 0;
    for (const date of days) {
        for (const s of statuses.filter((st) => st.date === date)) {
            if (s.status === 'taken') {
                taken++;
                resolved++;
            } else if (s.status === 'not taken') {
                resolved++;
            }
        }
    }
    return resolved === 0 ? 0 : Math.round((taken / resolved) * 100);
}

export function calculateStreak(statuses: MedicationStatus[], today: Date = new Date()): number {
    let streak = 0;
    for (let i = 0; i < 3650; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStatuses = statuses.filter((s) => s.date === toDateKey(d));
        if (dayStatuses.length === 0) break;
        if (!dayStatuses.every((s) => s.status === ' taken')) break;
        streak++;
    }
    return streak;
}