import React, { useEffect, useState, useRef } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    AppState,
    AppStateStatus,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CRISIS_START_KEY = 'last_crisis_start_timestamp';

type TimeSince = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export default function CrisisTracker() {
    const [crisisStartTime, setCrisisStartTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeSince>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const calculateTimeLeft = (startTimeMs: number) => {
        const totalSeconds = Math.max(0, Math.floor((Date.now() - startTimeMs) / 1000));

        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { days, hours, minutes, seconds };
    };

    const loadCrisisTimestamp = async () => {
        try {
            const storedTime = await AsyncStorage.getItem(CRISIS_START_KEY);
            if (storedTime) {
                const timestamp = parseInt(storedTime, 10);
                setCrisisStartTime(timestamp);
                setTimeLeft(calculateTimeLeft(timestamp));
            }
        } catch (error) {
            console.error('Failed to load crisis start time:', error);
        }
    };

    // 1. Initial load
    useEffect(() => {
        loadCrisisTimestamp();
    }, []);

    // 2. Active timer interval
    useEffect(() => {
        if (!crisisStartTime) return;

        setTimeLeft(calculateTimeLeft(crisisStartTime));

        timerRef.current = setInterval(() => {
            setTimeLeft(calculateTimeLeft(crisisStartTime));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [crisisStartTime]);

    // 3. Keep timer in sync on app foreground resume
    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active' && crisisStartTime) {
                setTimeLeft(calculateTimeLeft(crisisStartTime));
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [crisisStartTime]);

    const handleResetCrisis = async () => {
        const now = Date.now();
        try {
            await AsyncStorage.setItem(CRISIS_START_KEY, now.toString());
            setCrisisStartTime(now);
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } catch (error) {
            console.error('Failed to save timestamp:', error);
        }
    };

    return (
        <View style={styles.section}>
            <View style={styles.container}>
                <View style={styles.timerRow}>
                    {Object.entries(timeLeft).map(([label, value]) => {
                        if (typeof value === 'boolean') return null;

                        return (
                            <View style={styles.unitContainer} key={label}>
                                <View style={styles.digitBox}>
                                    <Text style={styles.digitText}>
                                        {value.toString().padStart(2, '0')}
                                    </Text>
                                </View>
                                <Text style={styles.unitLabel}>{label[0]}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity onPress={handleResetCrisis} activeOpacity={0.8}>
                <View style={[styles.innerContent, { backgroundColor: '#0B1C49' }]}>
                    <Text style={styles.btnText}>Start / Reset Streak</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginVertical: 16, 
    },
    headerText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000000",
        fontFamily: "Outfit_600SemiBold",
        marginBottom: 20,
    },
    timerRow: {
        flexDirection: 'row',
        gap: 12, 
    },
    unitContainer: {
        alignItems: 'center',
    },
    digitBox: {
        backgroundColor: '#0B1C49',
        borderRadius: 6, 
        width: 60, 
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    },
    digitText: {
        color: '#FFFFFF',
        fontSize: 25,
        fontFamily: 'monospace', 
    },
    unitLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
        color: '#03071e',
        textTransform: 'uppercase',
    },
    innerContent: {
        paddingVertical: 15,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '800',
        fontFamily: 'Outfit_700Bold',
    },
});