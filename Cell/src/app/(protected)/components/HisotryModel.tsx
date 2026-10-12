import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdherence } from '../../hooks/useAdherence';
import { getWeekdayLabel, summarizeDay, DaySummary } from '../../utils/adherence';
import { useTheme } from 'expo-router';

function dotColor(day: DaySummary) {
    if (day.total === 0) return '#E2E8F0';
    if (day.notTaken > 0) return '#E53E3E';
    if (day.taken === day.total) return '#38A169';
    return '#E2E8F0';
}

export function HistoryModal() {
    const [visible, setVisible] = useState(false);
    const { colors } = useTheme();
    const { statuses, streak, adherencePercent, last7Days, refresh } = useAdherence();

    return (
        <>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                    refresh();
                    setVisible(true);
                }}
                testID="historyButton"
                activeOpacity={0.8}
            >
                <Ionicons name="stats-chart" size={20} color="#0D1117" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={styles.overlay}>
                    <View style={[styles.box, { backgroundColor: colors.surface || '#FFFFFF' }]}>

                        {/* Header Badge & Title */}
                        <View style={styles.iconBadge}>
                            <Ionicons name="analytics-outline" size={26} color="#0B1C49" />
                        </View>

                        <Text style={[styles.title, { color: colors.text || '#0D1117' }]}>Adherence History</Text>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBlock}>
                                <Text style={[styles.statValue, { color: '#0D1117' }]}>{adherencePercent}%</Text>
                                <Text style={styles.statLabel}>Last 7 days</Text>
                            </View>

                            <View style={styles.statDivider} />

                            <View style={styles.statBlock}>
                                <View style={styles.streakRow}>
                                    <Ionicons name="flame" size={22} color="#FF5252" style={styles.streakIcon} />
                                    <Text style={[styles.statValue, { color: '#0D1117' }]}>{streak}</Text>
                                </View>
                                <Text style={styles.statLabel}>Day streak</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* 7-Day History Strip */}
                        <View style={styles.daysRow}>
                            {[...last7Days].reverse().map((date) => {
                                const day = summarizeDay(statuses, date);
                                return (
                                    <View key={date} style={styles.dayCell}>
                                        <Text style={styles.dayLabel}>{getWeekdayLabel(date)}</Text>
                                        <View style={[styles.dayDot, { backgroundColor: dotColor(day) }]} />
                                        <Text style={styles.dayFraction}>
                                            {day.total === 0 ? '–' : `${day.taken}/${day.total}`}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Close Action Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setVisible(false)}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    box: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    iconBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 8,
    },
    statBlock: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6E737B',
        marginTop: 2,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakIcon: {
        marginRight: 4,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#E2E8F0',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 20,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
    },
    dayCell: {
        alignItems: 'center',
        flex: 1,
    },
    dayLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6E737B',
        marginBottom: 8,
    },
    dayDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 6,
    },
    dayFraction: {
        fontSize: 10,
        fontWeight: '600',
        color: '#9E9E9E',
    },
    closeButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        backgroundColor: '#0B1C49',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});