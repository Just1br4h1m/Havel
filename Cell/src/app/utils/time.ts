export type TimeCategory = 'Morning' | 'Afternoon' | 'Evening';

export function getCurrentTimeCategory(): TimeCategory {
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    return 'Evening';
}

export function getTimeCategory(hour: number): TimeCategory {
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}

export function formatTime(hour: number, minute: number): string {
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

